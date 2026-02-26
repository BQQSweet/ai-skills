export declare function buildCookingChatPrompt(recipeName: string, currentStep: {
    order: number;
    instruction: string;
}, allSteps: Array<{
    order: number;
    instruction: string;
}>, question: string): ({
    role: "system";
    content: string;
} | {
    role: "user";
    content: string;
})[];
