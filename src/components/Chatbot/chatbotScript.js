import { getMaintenanceData, processMaintenanceData } from '../../api/maintenanceEndpoints';

// Initialize maintenance data
let maintenanceData = {};

// Reference to the selection state, will be set by the Chatbot component
let selectionRef = null;
let forceUpdateFn = null;

// Function to set up the selection reference
export const initializeSelectionRef = (ref, updateFn) => {
    selectionRef = ref;
    forceUpdateFn = updateFn;
    console.log('Selection ref initialized');
};

// Helper function to update selection and trigger re-render
const updateSelection = (field, value) => {
    if (selectionRef && selectionRef.current) {
        selectionRef.current[field] = value;
        console.log(`Updated ${field} to:`, value);
        console.log('Current selection:', selectionRef.current);
        if (forceUpdateFn) forceUpdateFn(prev => prev + 1);
    }
};

// Helper function to get selection summary
const getSelectionSummary = () => {
    if (!selectionRef || !selectionRef.current) return '';
    
    const summary = [];
    const selection = selectionRef.current;
    
    if (selection.brand) summary.push(`Brand: ${selection.brand}`);
    if (selection.category) summary.push(`Category: ${selection.category}`);
    if (selection.department) summary.push(`Department: ${selection.department}`);
    if (selection.subDepartment) summary.push(`Sub-Department: ${selection.subDepartment}`);
    
    return summary.join('\n');
};

// Chatbot script data structure - minimal initial state
export const chatbotScript = {
    start: {
        id: 'start',
        message: "Hello! I'm your DeeDee assistant. Please select a brand to start:",
        options: [] // Will be populated by updateChatbotScript
    }
};

// Function to initialize the maintenance data
export const initializeMaintenanceData = async () => {
    try {
        const data = await getMaintenanceData();
        console.log('Raw maintenance data:', data);
        maintenanceData = processMaintenanceData(data);
        console.log('Processed maintenance data:', maintenanceData);
        updateChatbotScript();
    } catch (error) {
        console.error('Error initializing maintenance data:', error);
        maintenanceData = {};
    }
};

// Function to update chatbot script with maintenance data
export const updateChatbotScript = () => {
    // Reset start options with available brands
    chatbotScript.start.options = Object.keys(maintenanceData).map(brand => ({
        text: brand,
        nextId: `category_${brand}`,
        onSelect: () => updateSelection('brand', brand)
    }));

    // Create category nodes for each brand
    Object.entries(maintenanceData).forEach(([brand, brandData]) => {
        chatbotScript[`category_${brand}`] = {
            id: `category_${brand}`,
            message: `Please select a category from ${brand}:`,
            options: [
                ...Object.keys(brandData.categories).map(category => ({
                    text: category,
                    nextId: `department_${brand}_${category}`,
                    onSelect: () => updateSelection('category', category)
                })),
                { text: "Back to brands", nextId: "start" }
            ]
        };

        // Create department nodes for each category
        Object.entries(brandData.categories).forEach(([category, categoryData]) => {
            chatbotScript[`department_${brand}_${category}`] = {
                id: `department_${brand}_${category}`,
                message: `Please select a department for ${category}:`,
                options: [
                    ...Object.keys(categoryData.departments).map(department => ({
                        text: department,
                        nextId: `subdepartment_${brand}_${category}_${department}`,
                        onSelect: () => updateSelection('department', department)
                    })),
                    { text: "Back to categories", nextId: `category_${brand}` }
                ]
            };

            // Create subdepartment nodes for each department
            Object.entries(categoryData.departments).forEach(([department, departmentData]) => {
                chatbotScript[`subdepartment_${brand}_${category}_${department}`] = {
                    id: `subdepartment_${brand}_${category}_${department}`,
                    message: `Select a sub-department for ${department}:`,
                    options: [
                        ...departmentData.subDepartments.map(subDepartment => ({
                            text: subDepartment,
                            nextId: "result",
                            onSelect: () => updateSelection('subDepartment', subDepartment)
                        })),
                        { text: "Back to departments", nextId: `department_${brand}_${category}` }
                    ]
                };
            });
        });
    });

    // Add result node to show selection summary
    chatbotScript.result = {
        id: 'result',
        get message() {
            return `Here's your selection:\n\n${getSelectionSummary()}\n\nWould you like to:`;
        },
        get options() {
            return [
                { 
                    text: "Make another selection", 
                    nextId: "start",
                    onSelect: () => {
                        if (selectionRef && selectionRef.current) {
                            selectionRef.current = {
                                brand: null,
                                category: null,
                                department: null,
                                subDepartment: null
                            };
                            if (forceUpdateFn) forceUpdateFn(prev => prev + 1);
                        }
                    }
                },
                { 
                    text: "Refine your search",
                    nextId: `category_${selectionRef?.current?.brand || ''}`
                }
            ];
        }
    };
};

// Helper function to get script by ID
export const getScriptById = (id) => {
    return chatbotScript[id] || chatbotScript.start;
};