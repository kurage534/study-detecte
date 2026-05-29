import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

interface CoachRequest {
  subjects: Array<{ name: string; weaknessLevel: number }>;
  recentSessions: Array<{ date: string; subjectName: string; durationMinutes: number }>;
  goals: Array<{ subjectName: string; weeklyMinutes: number; achievedMinutes: number }>;
  streak: number;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY が設定されていません。Vercelの環境変数に追加してください。' },
      { status: 503 }
    );
  }

  let body: CoachRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'リクエストの解析に失敗しました' }, { status: 400 });
  }

  const { subjects, recentSessions, goals, streak } = body;

  const subjectList = subjects
    .map((s) => `・${s.name}（苦手度: ${s.weaknessLevel}/5）`)
    .join('\n');

  const sessionList = recentSessions.length > 0
    ? recentSessions.map((s) => `・${s.date} ${s.subjectName} ${s.durationMinutes}分`).join('\n')
    : '（直近7日間の学習記録なし）';

  const goalList = goals.length > 0
    ? goals.map((g) => `・${g.subjectName}: 目標${g.weeklyMinutes}分 / 実績${g.achievedMinutes}分`).join('\n')
    : '（目標未設定）';

  const prompt = `あなたは親切な学習コーチです。以下の学習データを分析し、日本語で短く実践的なアドバイスを3点お願いします。

【教科と苦手度】
${subjectList}

【直近7日間の学習記録】
${sessionList}

【今週の目標達成状況】
${goalList}

【連続学習日数】
${streak}日連続

アドバイスは：
- 箇条書き3点
- 各点は1〜2文で簡潔に
- 励ましと具体的な行動提案を含める
- マークダウンや記号は使わず、自然な日本語で`;

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const advice = message.content[0].type === 'text' ? message.content[0].text : '';
    return NextResponse.json({ advice });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `APIエラー: ${message}` }, { status: 500 });
  }
}
