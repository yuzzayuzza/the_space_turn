import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { interpretSpaceHeuristically } from './src/utils/spatialHermeneuticsEngine';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini if API key is present
  const ai = process.env.GEMINI_API_KEY
    ? new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasGeminiKey: !!process.env.GEMINI_API_KEY });
  });

  // Dynamic Spatial Hermeneutics Deconstruction API
  app.post('/api/deconstruct-space', async (req, res) => {
    const { space } = req.body;
    if (!space || typeof space !== 'string' || !space.trim()) {
      return res.status(400).json({ error: 'Space description is required' });
    }

    const trimmedSpace = space.trim();

    // 1. If Gemini API is available, try generating rich, tailored philosophical readings
    if (ai && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `用户输入了他此刻身处的空间：“${trimmedSpace}”。
请运用空间哲学8大范式（现象学与诗学、人文地理与地方感、环境心理与意象、社会与权力空间、网络社会与流动空间、解构建筑与事件空间、道家哲学与虚空、精神分析与拓扑）的思想家谱系（巴什拉/亲密空间、海德格尔/筑居思、梅洛-庞蒂/知觉具身、段义孚/从空间到地方与恋地情结、凯文·林奇/城市意象与可读性、列斐伏尔/空间生产三元论、福柯/异托邦与规训、德·塞托/漫步之诗与策略战术、曼纽尔·卡斯特尔/流动空间、大卫·哈维/时空压缩、伯纳德·屈米/曼哈顿转录与事件空间、老子/当其无有室之用、拉康/莫比乌斯环与外亲性）进行深度现场解构。
请精选其中最切合该空间特质的4位思想家，直击该空间的具体物理质感、光影、声音、温度、权力动线与心理张力。
严禁套用空洞模板，每位思想家的见解必须切中“${trimmedSpace}”独有的物理现实与本体论悖论。`;

        const geminiCall = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction:
              '你是一位享誉国际的空间哲学、建筑现象学与文化拓扑学大师。你擅长用精准、洗练、深刻的哲学语言对具体空间现场进行多重棱镜解构，文字典雅、具身感强烈。',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                categoryTag: {
                  type: Type.STRING,
                  description: '空间范畴标签，附英文，如：流动载具与时空压缩 (Transit & Velocity)',
                },
                spatialDialectic: {
                  type: Type.STRING,
                  description: '该空间的核心张力/辩证题，如：飞驰的速度吞噬地理，凝滞的身体向内折叠',
                },
                poeticDiagnosis: {
                  type: Type.STRING,
                  description: '对该空间的一至两句诗性本体论诊断',
                },
                readings: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      thinkerId: {
                        type: Type.STRING,
                        description: 'bachelard, heidegger, lefebvre, foucault, lacan, laozi, benjamin, koolhaas, 或 harvey',
                      },
                      thinkerName: {
                        type: Type.STRING,
                        description: '思想家中文名与学派，如：加斯东·巴什拉 (现象学与诗学)',
                      },
                      paradigm: {
                        type: Type.STRING,
                        description: '经典流派或著作，如：空间的诗学',
                      },
                      concept: {
                        type: Type.STRING,
                        description: '针对该空间提炼的核心概念，如：移动摇篮与车窗白日梦',
                      },
                      reading: {
                        type: Type.STRING,
                        description: '深刻且紧密结合该空间细节的哲学洞见，2-3句',
                      },
                      provocativeQuestion: {
                        type: Type.STRING,
                        description: '引导用户观察当下周遭环境的沉思提问',
                      },
                    },
                    required: [
                      'thinkerId',
                      'thinkerName',
                      'paradigm',
                      'concept',
                      'reading',
                      'provocativeQuestion',
                    ],
                  },
                },
              },
              required: ['categoryTag', 'spatialDialectic', 'poeticDiagnosis', 'readings'],
            },
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API call timed out after 6s')), 6000)
        );

        const response = await Promise.race([geminiCall, timeoutPromise]);

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return res.json({
            space: trimmedSpace,
            categoryTag: parsed.categoryTag,
            spatialDialectic: parsed.spatialDialectic,
            poeticDiagnosis: parsed.poeticDiagnosis,
            sourceEngine: 'gemini',
            readings: parsed.readings,
          });
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local hermeneutic engine:', err);
      }
    }

    // 2. Fallback: Intelligent semantic spatial hermeneutics engine
    const localResult = interpretSpaceHeuristically(trimmedSpace);
    return res.json(localResult);
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
