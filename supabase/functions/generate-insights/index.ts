
// Follow Deno runtime API
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.17.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a Supabase client with the service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { 
        auth: { 
          persistSession: false 
        }
      }
    );

    console.log(`Generating insights for user: ${userId}`);
    
    // Fetch all work schedules for the user
    const { data: schedules, error: schedulesError } = await supabaseAdmin
      .from('work_schedules')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (schedulesError) {
      console.error('Error fetching work schedules:', schedulesError);
      return new Response(
        JSON.stringify({ error: schedulesError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user profile to get gender information
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('gender')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error fetching user profile:', profileError);
    }

    const userGender = userProfile?.gender || null;
    console.log(`User gender: ${userGender}`);

    // Delete existing insights for this user
    const { error: deleteError } = await supabaseAdmin
      .from('insights')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting existing insights:', deleteError);
      return new Response(
        JSON.stringify({ error: deleteError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate insights based on the work schedules
    const insights = generateInsightsFromSchedules(schedules, userId, userGender);
    
    // Insert the generated insights into the database
    const { data: insertedInsights, error: insertError } = await supabaseAdmin
      .from('insights')
      .insert(insights)
      .select();

    if (insertError) {
      console.error('Error inserting insights:', insertError);
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully generated ${insertedInsights?.length || 0} insights`);
    
    return new Response(
      JSON.stringify({ success: true, insights: insertedInsights }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error('Unexpected error in generate-insights function:', err);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Function to generate insights from work schedules
function generateInsightsFromSchedules(schedules, userId, userGender) {
  const today = new Date();
  const insights = [];

  if (!schedules || schedules.length === 0) {
    // Default insights if no schedules available
    insights.push({
      user_id: userId,
      date: today.toISOString(),
      title: "No Work Data Available",
      description: "Upload your work schedule to get personalized insights about your work patterns.",
      type: "productivity",
      priority: "medium",
      gender_specific: false
    });
    return insights;
  }

  // Group schedules by day of week
  const dayOfWeekCounts = {};
  const dayHours = {};
  const weeklyHours = {};
  let totalHours = 0;
  let nightShiftCount = 0;
  let longShiftCount = 0;
  let earlyStartCount = 0;
  let weekendCount = 0;
  let consecutiveDaysMax = 0;
  
  // Process each schedule
  let lastDate = null;
  let consecutiveDays = 0;
  
  schedules.forEach(shift => {
    // Parse date and times
    const shiftDate = new Date(shift.date);
    const dayOfWeek = shiftDate.getDay();
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
    
    // Calculate shift duration
    const startTimeParts = shift.start_time.split(':');
    const endTimeParts = shift.end_time.split(':');
    const startHour = parseInt(startTimeParts[0], 10);
    const startMinute = parseInt(startTimeParts[1], 10);
    const endHour = parseInt(endTimeParts[0], 10);
    const endMinute = parseInt(endTimeParts[1], 10);
    
    let hours = endHour - startHour;
    let minutes = endMinute - startMinute;
    
    if (minutes < 0) {
      hours--;
      minutes += 60;
    }
    
    const duration = hours + (minutes / 60);
    
    // Count occurrences of each day of week
    dayOfWeekCounts[dayName] = (dayOfWeekCounts[dayName] || 0) + 1;
    
    // Sum hours by day of week
    dayHours[dayName] = (dayHours[dayName] || 0) + duration;
    
    // Calculate weeknumber and add hours to weekly total
    const weekNumber = getWeekNumber(shiftDate);
    const weekKey = `${shiftDate.getFullYear()}-${weekNumber}`;
    weeklyHours[weekKey] = (weeklyHours[weekKey] || 0) + duration;
    
    // Track total hours
    totalHours += duration;
    
    // Check for night shifts (ending after 10 PM or starting before 6 AM)
    if (endHour >= 22 || startHour < 6) {
      nightShiftCount++;
    }
    
    // Check for long shifts (over 8 hours)
    if (duration > 8) {
      longShiftCount++;
    }
    
    // Check for early starts
    if (startHour < 7) {
      earlyStartCount++;
    }
    
    // Check for weekend shifts
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendCount++;
    }
    
    // Check for consecutive days
    if (lastDate) {
      const dayDifference = Math.floor((shiftDate - lastDate) / (1000 * 60 * 60 * 24));
      if (dayDifference === 1) {
        consecutiveDays++;
      } else {
        consecutiveDaysMax = Math.max(consecutiveDaysMax, consecutiveDays);
        consecutiveDays = 0;
      }
    }
    
    lastDate = shiftDate;
  });
  
  // Finalize consecutive days calculation
  consecutiveDaysMax = Math.max(consecutiveDaysMax, consecutiveDays);
  
  // Find busiest day
  let busiestDay = null;
  let busiestDayHours = 0;
  Object.keys(dayHours).forEach(day => {
    if (dayHours[day] > busiestDayHours) {
      busiestDay = day;
      busiestDayHours = dayHours[day];
    }
  });
  
  // Find week with most hours
  let busiestWeek = null;
  let busiestWeekHours = 0;
  Object.keys(weeklyHours).forEach(week => {
    if (weeklyHours[week] > busiestWeekHours) {
      busiestWeek = week;
      busiestWeekHours = weeklyHours[week];
    }
  });
  
  // Calculate average hours per shift
  const averageHoursPerShift = totalHours / schedules.length;
  
  // Calculate average weekly hours
  const uniqueWeeks = Object.keys(weeklyHours).length;
  const averageWeeklyHours = uniqueWeeks > 0 ? totalHours / uniqueWeeks : 0;
  
  // Generate insights
  
  // 1. Busiest day insight
  if (busiestDay) {
    insights.push({
      user_id: userId,
      date: today.toISOString(),
      title: `${busiestDay} is Your Busiest Day`,
      description: `You work the most hours on ${busiestDay}s, averaging ${busiestDayHours.toFixed(1)} hours. Consider planning easier meals or activities for this day of the week.`,
      type: "productivity",
      priority: "medium",
      gender_specific: false
    });
  }
  
  // 2. Weekly hours insight
  if (averageWeeklyHours > 0) {
    let weeklyHoursDescription = `You work an average of ${averageWeeklyHours.toFixed(1)} hours per week.`;
    let weeklyHoursPriority = "low";
    
    if (averageWeeklyHours > 50) {
      weeklyHoursDescription += " This is significantly above the standard 40-hour workweek. Consider evaluating your work-life balance.";
      weeklyHoursPriority = "high";
    } else if (averageWeeklyHours > 40) {
      weeklyHoursDescription += " This is above the standard 40-hour workweek. Make sure you're taking time for yourself.";
      weeklyHoursPriority = "medium";
    }
    
    insights.push({
      user_id: userId,
      date: today.toISOString(),
      title: "Weekly Hours Analysis",
      description: weeklyHoursDescription,
      type: "balance",
      priority: weeklyHoursPriority,
      gender_specific: false
    });
  }
  
  // 3. Night shift insight
  if (nightShiftCount > 0) {
    const nightShiftPercentage = (nightShiftCount / schedules.length) * 100;
    if (nightShiftPercentage > 30) {
      insights.push({
        user_id: userId,
        date: today.toISOString(),
        title: "Night Shift Impact",
        description: `${nightShiftPercentage.toFixed(0)}% of your shifts are at night. Consider blackout curtains and consistent sleep schedules to mitigate circadian rhythm disruption.`,
        type: "sleep",
        priority: "high",
        gender_specific: false
      });
    }
  }
  
  // 4. Consecutive days insight
  if (consecutiveDaysMax >= 5) {
    insights.push({
      user_id: userId,
      date: today.toISOString(),
      title: "Extended Work Streaks",
      description: `You've worked up to ${consecutiveDaysMax} consecutive days. Extended work periods without days off can lead to burnout. Try to schedule at least one day off every 5-6 days.`,
      type: "health",
      priority: "high",
      gender_specific: false
    });
  }
  
  // 5. Weekend work insight
  if (weekendCount > 0) {
    const weekendPercentage = (weekendCount / schedules.length) * 100;
    if (weekendPercentage > 25) {
      insights.push({
        user_id: userId,
        date: today.toISOString(),
        title: "Weekend Work Balance",
        description: `You work ${weekendPercentage.toFixed(0)}% of your shifts on weekends. Consider scheduling important personal activities during your weekday off times to maintain social connections.`,
        type: "balance",
        priority: "medium",
        gender_specific: false
      });
    }
  }
  
  // 6. Long shifts insight
  if (longShiftCount > 0) {
    const longShiftPercentage = (longShiftCount / schedules.length) * 100;
    if (longShiftPercentage > 30) {
      insights.push({
        user_id: userId,
        date: today.toISOString(),
        title: "Long Shift Management",
        description: `${longShiftPercentage.toFixed(0)}% of your shifts exceed 8 hours. During long shifts, try to take short breaks every 2 hours and stay hydrated to maintain productivity.`,
        type: "health",
        priority: "medium",
        gender_specific: false
      });
    }
  }
  
  // 7. Early shifts insight
  if (earlyStartCount > 0) {
    const earlyShiftPercentage = (earlyStartCount / schedules.length) * 100;
    if (earlyShiftPercentage > 30) {
      insights.push({
        user_id: userId,
        date: today.toISOString(),
        title: "Early Shift Sleep Recommendation",
        description: `${earlyShiftPercentage.toFixed(0)}% of your shifts start before 7 AM. For optimal performance, aim to sleep 7-8 hours by going to bed before 10 PM on nights before early shifts.`,
        type: "sleep",
        priority: "medium",
        gender_specific: false
      });
    }
  }
  
  // 8. Add gender-specific insights for female users
  if (userGender === 'female') {
    // Female-specific insights for night shift workers
    if (nightShiftCount > 0) {
      insights.push({
        user_id: userId,
        date: today.toISOString(),
        title: "Women's Health: Night Shift Impact",
        description: "Night shifts can affect menstrual regularity. Consider tracking your cycle to identify any patterns. Prioritize quality sleep between shifts to help regulate hormones.",
        type: "cycle",
        priority: "medium",
        gender_specific: true
      });
    }
    
    // Female-specific insights for long shifts
    if (longShiftCount > 0) {
      insights.push({
        user_id: userId,
        date: today.toISOString(),
        title: "Women's Health: Energy Management",
        description: "Energy levels fluctuate with your menstrual cycle. During the luteal phase (week before your period), you may need extra breaks and hydration during long shifts.",
        type: "cycle",
        priority: "medium",
        gender_specific: true
      });
    }
  }
  
  // Ensure we have at least 3 insights
  if (insights.length < 3) {
    // Add general productivity insight
    insights.push({
      user_id: userId,
      date: today.toISOString(),
      title: "Productivity Optimization",
      description: "Research shows that taking short 5-minute breaks every 90 minutes can boost productivity by up to 20%. Try implementing the Pomodoro technique during your shifts.",
      type: "productivity",
      priority: "low",
      gender_specific: false
    });
    
    // Add general sleep insight
    insights.push({
      user_id: userId,
      date: today.toISOString(),
      title: "Sleep Quality Improvement",
      description: "Consistent sleep and wake times, even on days off, can improve overall sleep quality and energy levels during work hours.",
      type: "sleep",
      priority: "low",
      gender_specific: false
    });
  }
  
  return insights;
}

// Helper function to get week number from date
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
