export declare function buildRecipeGeneratePrompt(ingredients: string[], preferences: {
    diet_type?: string;
    allergies?: string[];
    taste?: string[];
}, memberCount: number): ({
    role: "system";
    content: string;
} | {
    role: "user";
    content: string;
})[];
