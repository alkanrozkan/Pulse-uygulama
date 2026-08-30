-- Seed data for the Viral Radar.
-- Run after schema.sql. Replace with a real ingestion job later —
-- see src/lib/trends/provider.ts for the interface a live source must satisfy.

insert into public.trends (topic, format, velocity_score, trend_age_days, competition_level, niche, platform, angle_template, source)
values
  ('Day-in-the-life speedruns under 20s', 'voiceover_broll', 92, 4, 'medium', 'lifestyle', 'tiktok',
   'Compress a full working day in {niche} into 18 seconds, one cut per hour.', 'seed'),
  ('"I was wrong about..." reversal openers', 'talking_head', 88, 9, 'low', null, 'tiktok',
   'Name a belief you held about {niche} for years, then show what changed your mind.', 'seed'),
  ('Silent screen-record tutorials with text captions', 'screen_recording', 85, 6, 'medium', 'tech', 'instagram',
   'Record the exact {niche} workflow you use daily with no voiceover — captions only.', 'seed'),
  ('Before/after with the process hidden', 'text_on_screen', 81, 12, 'high', null, 'instagram',
   'Show the finished {niche} result first, then rewind through the three steps that got you there.', 'seed'),
  ('Price-breakdown receipts', 'talking_head', 78, 3, 'low', 'finance', 'tiktok',
   'Break down what one {niche} project actually cost you, line by line.', 'seed'),
  ('Reading my own old content and rating it', 'talking_head', 74, 15, 'medium', null, 'tiktok',
   'React to your worst-performing {niche} post and diagnose why it flopped.', 'seed'),
  ('60-second myth teardowns', 'voiceover_broll', 71, 8, 'high', 'education', 'instagram',
   'Take the most repeated piece of {niche} advice and show the data against it.', 'seed'),
  ('POV: the thing nobody warns you about', 'skit', 69, 21, 'high', null, 'tiktok',
   'Act out the unglamorous part of {niche} that only insiders know.', 'seed'),
  ('Tool stack tours, one tool per cut', 'screen_recording', 66, 11, 'medium', 'tech', 'instagram',
   'Show the five tools you actually open every day for {niche}, five seconds each.', 'seed'),
  ('Photo carousels with a text hook on slide one', 'photo_carousel', 63, 18, 'low', null, 'instagram',
   'Turn your best-performing {niche} video script into a seven-slide carousel.', 'seed')
on conflict do nothing;
