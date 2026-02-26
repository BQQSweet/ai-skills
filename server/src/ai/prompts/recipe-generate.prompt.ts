/**
 * Prompt 模板：食谱生成
 * 调用方式：AiService.chatStream(buildRecipeGeneratePrompt(...))
 */
export function buildRecipeGeneratePrompt(
  ingredients: string[],
  preferences: { diet_type?: string; allergies?: string[]; taste?: string[] },
  memberCount: number,
) {
  return [
    {
      role: 'system' as const,
      content: `你是一位专业中餐厨师和营养师。请根据用户提供的食材，生成适合家庭烹饪的食谱。

## 输出要求
- 生成 3-5 道菜品推荐
- 每道菜包含: 菜名、简介、难度(easy/medium/hard)、烹饪时间、食材清单、分步骤操作、营养信息
- 优先使用用户提供的食材，可补充少量常见调味料
- 考虑用户的饮食偏好和过敏源
- 每个步骤如需计时，标注 timer_required: true 和 duration_min

## 输出格式（严格 JSON）
{
  "recipes": [
    {
      "title": "菜名",
      "description": "一句话简介",
      "difficulty": "easy|medium|hard",
      "cook_time": 分钟数,
      "servings": ${memberCount},
      "ingredients": [
        {"name": "食材名", "quantity": 数量, "unit": "单位", "optional": false}
      ],
      "steps": [
        {"order": 1, "instruction": "步骤描述", "duration_min": null, "timer_required": false}
      ],
      "nutrition": {
        "calories": 千卡, "protein_g": 克, "carbs_g": 克, "fat_g": 克
      },
      "tags": ["家常菜"]
    }
  ]
}`,
    },
    {
      role: 'user' as const,
      content: `可用食材：${ingredients.join('、')}
饮食偏好：${preferences.diet_type || '无'}
过敏源：${preferences.allergies?.join('、') || '无'}
口味偏好：${preferences.taste?.join('、') || '不限'}
用餐人数：${memberCount}人`,
    },
  ];
}
