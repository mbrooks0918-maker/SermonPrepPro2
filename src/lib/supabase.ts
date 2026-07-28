import { createClient } from '@supabase/supabase-js'
import { SermonSeries, Sermon } from '@/types/sermon'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// Fallback to localStorage when Supabase is not configured
const SERIES_STORAGE_KEY = 'sermon_series'
const SERMONS_STORAGE_KEY = 'sermons'

const getFromStorage = (key: string) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

export const sermonSeriesService = {
  async getAll(): Promise<SermonSeries[]> {
    if (!supabase) {
      return getFromStorage(SERIES_STORAGE_KEY)
    }
    
    try {
      const { data, error } = await supabase
        .from('sermon_series')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Supabase error, falling back to localStorage:', error)
      return getFromStorage(SERIES_STORAGE_KEY)
    }
  },

  async create(series: Partial<SermonSeries>): Promise<SermonSeries> {
    const newSeries = {
      ...series,
      id: series.id || crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as SermonSeries

    if (!supabase) {
      const existing = getFromStorage(SERIES_STORAGE_KEY)
      const updated = [...existing, newSeries]
      saveToStorage(SERIES_STORAGE_KEY, updated)
      return newSeries
    }

    try {
      const { data, error } = await supabase
        .from('sermon_series')
        .insert([{
          title: series.title,
          description: series.description,
          summary: series.summary,
          color: series.color,
          start_date: series.startDate || null,
          end_date: series.endDate || null,
          status: series.status || 'planning',
          artwork: series.artwork,
          bumperVideo: series.bumperVideo
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.warn('Supabase error, falling back to localStorage:', error)
      const existing = getFromStorage(SERIES_STORAGE_KEY)
      const updated = [...existing, newSeries]
      saveToStorage(SERIES_STORAGE_KEY, updated)
      return newSeries
    }
  },

  async update(id: string, updates: Partial<SermonSeries>): Promise<SermonSeries> {
    if (!supabase) {
      const existing = getFromStorage(SERIES_STORAGE_KEY)
      const updated = existing.map((s: SermonSeries) => 
        s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
      )
      saveToStorage(SERIES_STORAGE_KEY, updated)
      return updated.find((s: SermonSeries) => s.id === id)
    }

    try {
      const updateData: any = {}
      if ('title' in updates) updateData.title = updates.title
      if ('description' in updates) updateData.description = updates.description
      if ('summary' in updates) updateData.summary = updates.summary
      if ('color' in updates) updateData.color = updates.color
      // Persist NULL (not '') when a date is cleared, so unscheduled series
      // store no date and are correctly treated as having no schedule.
      if ('startDate' in updates) updateData.start_date = updates.startDate || null
      if ('endDate' in updates) updateData.end_date = updates.endDate || null
      if ('status' in updates) updateData.status = updates.status
      if ('artwork' in updates) updateData.artwork = updates.artwork
      if ('bumperVideo' in updates) updateData.bumperVideo = updates.bumperVideo
      // Always bump updated_at so every write produces a distinct timestamp.
      // Realtime consumers dedupe on updated_at; without this it stays static
      // and live updates after the first one get silently suppressed.
      updateData.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('sermon_series')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.warn('Supabase error, falling back to localStorage:', error)
      const existing = getFromStorage(SERIES_STORAGE_KEY)
      const updated = existing.map((s: SermonSeries) => 
        s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
      )
      saveToStorage(SERIES_STORAGE_KEY, updated)
      return updated.find((s: SermonSeries) => s.id === id)
    }
  },

  async delete(id: string): Promise<void> {
    if (!supabase) {
      const existing = getFromStorage(SERIES_STORAGE_KEY)
      const updated = existing.filter((s: SermonSeries) => s.id !== id)
      saveToStorage(SERIES_STORAGE_KEY, updated)
      return
    }

    try {
      const { error } = await supabase
        .from('sermon_series')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.warn('Supabase error, falling back to localStorage:', error)
      const existing = getFromStorage(SERIES_STORAGE_KEY)
      const updated = existing.filter((s: SermonSeries) => s.id !== id)
      saveToStorage(SERIES_STORAGE_KEY, updated)
    }
  }
}

export const sermonService = {
  async getBySeriesId(seriesId: string): Promise<Sermon[]> {
    if (!supabase) {
      const allSermons = getFromStorage(SERMONS_STORAGE_KEY)
      return allSermons.filter((s: Sermon) => s.series_id === seriesId)
    }

    try {
      const { data, error } = await supabase
        .from('sermons')
        .select('*')
        .eq('series_id', seriesId)
        .order('date', { ascending: true })
      
      if (error) throw error
      
      return (data || []).map((row: any) => ({
        ...row,
        serviceAgenda: row.service_agenda || '',
        announcements: row.announcements || '',
        socialMediaPlan: row.social_media_plan || '',
        customFields: row.custom_fields || {},
        ai_content: row.ai_content || ''
      }))
    } catch (error) {
      console.warn('Supabase error, falling back to localStorage:', error)
      const allSermons = getFromStorage(SERMONS_STORAGE_KEY)
      return allSermons.filter((s: Sermon) => s.series_id === seriesId)
    }
  },

  async create(sermon: Partial<Sermon> & { series_id: string }): Promise<Sermon> {
    const newSermon = {
      ...sermon,
      id: sermon.id || crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Sermon

    if (!supabase) {
      const existing = getFromStorage(SERMONS_STORAGE_KEY)
      const updated = [...existing, newSermon]
      saveToStorage(SERMONS_STORAGE_KEY, updated)
      return newSermon
    }

    try {
      const { data, error } = await supabase
        .from('sermons')
        .insert([{
          series_id: sermon.series_id,
          title: sermon.title,
          description: sermon.description,
          scripture: sermon.scripture,
          theme: sermon.theme,
          date: sermon.date,
          notes: sermon.notes,
          service_agenda: sermon.serviceAgenda,
          songs: sermon.songs,
          creative_elements: sermon.creativeElements,
          announcements: sermon.announcements,
          social_media_plan: sermon.socialMediaPlan,
          communicator: sermon.communicator,
          custom_fields: sermon.customFields,
          status: sermon.status || 'draft',
          ai_content: (sermon as any).ai_content || null
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.warn('Supabase error, falling back to localStorage:', error)
      const existing = getFromStorage(SERMONS_STORAGE_KEY)
      const updated = [...existing, newSermon]
      saveToStorage(SERMONS_STORAGE_KEY, updated)
      return newSermon
    }
  },

  async update(id: string, updates: Partial<Sermon>): Promise<Sermon> {
    if (!supabase) {
      const existing = getFromStorage(SERMONS_STORAGE_KEY)
      const updated = existing.map((s: Sermon) => 
        s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
      )
      saveToStorage(SERMONS_STORAGE_KEY, updated)
      return updated.find((s: Sermon) => s.id === id)
    }

    try {
      const updateData: any = {}
      if ('title' in updates) updateData.title = updates.title
      if ('description' in updates) updateData.description = updates.description
      if ('scripture' in updates) updateData.scripture = updates.scripture
      if ('theme' in updates) updateData.theme = updates.theme
      // Persist NULL when the date is cleared or unparseable — never '' or an
      // Invalid Date object, so a cleared sermon reads back as unscheduled.
      if ('date' in updates) {
        const d: any = updates.date
        updateData.date = d && !isNaN(new Date(d).getTime()) ? d : null
      }
      if ('notes' in updates) updateData.notes = updates.notes
      if ('serviceAgenda' in updates) updateData.service_agenda = updates.serviceAgenda
      if ('songs' in updates) updateData.songs = updates.songs
      if ('creativeElements' in updates) updateData.creative_elements = updates.creativeElements
      if ('announcements' in updates) updateData.announcements = updates.announcements
      if ('socialMediaPlan' in updates) updateData.social_media_plan = updates.socialMediaPlan
      if ('communicator' in updates) updateData.communicator = updates.communicator
      if ('customFields' in updates) updateData.custom_fields = updates.customFields
      if ('status' in updates) updateData.status = updates.status
      if ('ai_content' in updates) updateData.ai_content = (updates as any).ai_content
      // Always bump updated_at so every write produces a distinct timestamp.
      // SermonDetail's Realtime handler dedupes on updated_at; without this it
      // stays static and live updates after the first one get silently suppressed.
      updateData.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('sermons')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.warn('Supabase error, falling back to localStorage:', error)
      const existing = getFromStorage(SERMONS_STORAGE_KEY)
      const updated = existing.map((s: Sermon) => 
        s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
      )
      saveToStorage(SERMONS_STORAGE_KEY, updated)
      return updated.find((s: Sermon) => s.id === id)
    }
  },

  async delete(id: string): Promise<void> {
    if (!supabase) {
      const existing = getFromStorage(SERMONS_STORAGE_KEY)
      const updated = existing.filter((s: Sermon) => s.id !== id)
      saveToStorage(SERMONS_STORAGE_KEY, updated)
      return
    }

    try {
      const { error } = await supabase
        .from('sermons')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.warn('Supabase error, falling back to localStorage:', error)
      const existing = getFromStorage(SERMONS_STORAGE_KEY)
      const updated = existing.filter((s: Sermon) => s.id !== id)
      saveToStorage(SERMONS_STORAGE_KEY, updated)
    }
  }
}
