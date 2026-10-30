'use strict';
(() => {
    const context = document.modelContext || navigator.modelContext;
    if (!context || typeof context.registerTool !== 'function') return;
    const tool = {
        name: 'get_onestep_study_guide',
        description: 'Read public One-Step study guidance and links to Malaysian university fees, courses, scholarships and contact information.',
        inputSchema: {type:'object',properties:{},additionalProperties:false},
        annotations: {readOnlyHint:true},
        execute: async () => {
            const response = await fetch('/index.md', {credentials:'omit'});
            if (!response.ok) throw new Error('Study guide is temporarily unavailable.');
            return {content:[{type:'text',text:await response.text()}]};
        }
    };
    try { Promise.resolve(context.registerTool(tool)).catch(() => {}); } catch {}
})();
