import { supabase } from './supabaseClient';

const BUCKET_NAME = 'survey-media';

export const uploadFile = async (file: File, path: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Error uploading file: ${error.message}`);
  }

  return data.path;
};

export const getPublicUrl = (path: string): string => {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
};

export const deleteFile = async (path: string): Promise<void> => {
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

  if (error) {
    throw new Error(`Error deleting file: ${error.message}`);
  }
};

