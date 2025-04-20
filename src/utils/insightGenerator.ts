
import { supabase } from "@/integrations/supabase/client";
import { Insight } from "@/utils/insightUtils";

export interface WorkSchedule {
  id: number | string;
  date: Date;
  startTime: string;
  endTime: string;
  title: string;
  synced?: boolean;
  userId?: string;
}

export async function generateInsightsFromSchedule(
  schedule: WorkSchedule[], 
  userGender?: string, 
  userId?: string
): Promise<Insight[]> {
  if (!userId) {
    console.error("Cannot generate insights: No user ID provided");
    return [];
  }

  try {
    // Call the edge function to generate insights
    const { data, error } = await supabase.functions.invoke('generate-insights', {
      body: { userId },
    });

    if (error) {
      console.error("Error generating insights:", error);
      return [];
    }

    if (!data || !data.insights || !Array.isArray(data.insights)) {
      console.error("Invalid response from generate-insights function:", data);
      return [];
    }
    
    // Transform the data from the database format to the app format
    const insights: Insight[] = data.insights.map((insight: any) => ({
      id: insight.id,
      date: new Date(insight.date),
      title: insight.title,
      description: insight.description,
      type: insight.type,
      priority: insight.priority,
      genderSpecific: insight.gender_specific
    }));

    return insights;
  } catch (error) {
    console.error("Failed to generate insights:", error);
    return [];
  }
}

export async function saveInsightsToStorage(insights: Insight[], userId?: string): Promise<void> {
  if (!userId) {
    console.error("Cannot save insights: No user ID provided");
    return;
  }

  try {
    // First, delete existing insights for this user
    await supabase
      .from('insights')
      .delete()
      .match({ user_id: userId });

    // Then insert the new insights
    const insightsToInsert = insights.map(insight => ({
      user_id: userId,
      date: insight.date instanceof Date ? insight.date.toISOString() : insight.date,
      title: insight.title,
      description: insight.description,
      type: insight.type,
      priority: insight.priority,
      gender_specific: insight.genderSpecific || false
    }));

    const { error } = await supabase
      .from('insights')
      .insert(insightsToInsert);

    if (error) {
      console.error("Error saving insights to database:", error);
    } else {
      console.log(`Saved ${insights.length} insights to database for user: ${userId}`);
    }
  } catch (error) {
    console.error("Failed to save insights to database:", error);
  }
}

export async function getInsightsFromStorage(userId?: string): Promise<Insight[]> {
  if (!userId) {
    console.error("Cannot get insights: No user ID provided");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error("Error fetching insights from database:", error);
      return [];
    }

    const insights: Insight[] = data.map(item => ({
      id: item.id,
      date: new Date(item.date),
      title: item.title,
      description: item.description,
      type: item.type,
      priority: item.priority,
      genderSpecific: item.gender_specific
    }));

    console.log(`Retrieved ${insights.length} insights from database for user: ${userId}`);
    return insights;
  } catch (error) {
    console.error("Failed to get insights from database:", error);
    return [];
  }
}

export async function saveScheduleToStorage(schedule: WorkSchedule[], userId?: string): Promise<void> {
  if (!userId) {
    console.error("Cannot save schedule: No user ID provided");
    return;
  }

  try {
    const schedulesToInsert = schedule.map(item => ({
      user_id: userId,
      date: item.date instanceof Date ? item.date.toISOString().split('T')[0] : item.date,
      start_time: item.startTime,
      end_time: item.endTime,
      title: item.title,
      synced: item.synced || false
    }));

    const { error } = await supabase
      .from('work_schedules')
      .upsert(schedulesToInsert, { 
        onConflict: 'user_id,date,start_time,end_time',
        ignoreDuplicates: false
      });

    if (error) {
      console.error("Error saving schedule to database:", error);
    } else {
      console.log(`Saved ${schedule.length} schedule items to database for user: ${userId}`);
    }
  } catch (error) {
    console.error("Failed to save schedule to database:", error);
  }
}

export async function getScheduleFromStorage(userId?: string): Promise<WorkSchedule[]> {
  if (!userId) {
    console.error("Cannot get schedule: No user ID provided");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('work_schedules')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error("Error fetching schedule from database:", error);
      return [];
    }

    const schedule: WorkSchedule[] = data.map(item => ({
      id: item.id,
      date: new Date(item.date),
      startTime: item.start_time,
      endTime: item.end_time,
      title: item.title,
      synced: item.synced,
      userId: item.user_id
    }));

    console.log(`Retrieved ${schedule.length} schedule items from database for user: ${userId}`);
    return schedule;
  } catch (error) {
    console.error("Failed to get schedule from database:", error);
    return [];
  }
}

export function prepareDataForStorage(data: any, userId?: string): any {
  if (!data) return null;
  
  return {
    ...data,
    userId: userId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
