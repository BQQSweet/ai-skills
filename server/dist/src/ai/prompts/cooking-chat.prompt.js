"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCookingChatPrompt = buildCookingChatPrompt;
function buildCookingChatPrompt(recipeName, currentStep, allSteps, question) {
    return [
        {
            role: 'system',
            content: `你是用户的烹饪助手，正在指导用户烹饪「${recipeName}」。
当前在第 ${currentStep.order} 步：${currentStep.instruction}

全部步骤：
${allSteps.map((s) => `${s.order}. ${s.instruction}`).join('\n')}

请用简短、口语化的方式回答用户的烹饪问题。
回答控制在 2-3 句话以内，因为会通过语音播报。
如果问题与当前烹饪无关，礼貌地引导回到烹饪话题。`,
        },
        { role: 'user', content: question },
    ];
}
//# sourceMappingURL=cooking-chat.prompt.js.map