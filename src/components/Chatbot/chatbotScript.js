import { getMaintenanceData, processMaintenanceData, generateDesign } from '../../api/maintenanceEndpoints';

// Initialize maintenance data
let maintenanceData = {};

// Track the last selection for design generation
let lastSelection = null;

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
        console.log('Processed maintenance options:', maintenanceData);
        updateChatbotScript();
        console.log('Updated chatbot script:', chatbotScript);
    } catch (error) {
        console.error('Error initializing maintenance data:', error);
    }
};

// Function to update chatbot script with maintenance data
export const updateChatbotScript = () => {
    // Reset start options with available brands
    chatbotScript.start.options = Object.keys(maintenanceData).map(brand => ({
        text: brand,
        nextId: `category_${brand}`
    }));

    // Create category nodes for each brand
    Object.entries(maintenanceData).forEach(([brand, brandData]) => {
        chatbotScript[`category_${brand}`] = {
            id: `category_${brand}`,
            message: `Please select a category from ${brand}:`,
            options: Object.keys(brandData.categories).map(category => ({
                text: category,
                nextId: `department_${brand}_${category}`
            })).concat({ text: "Back to brands", nextId: "start" })
        };

        // Create department nodes for each category
        Object.entries(brandData.categories).forEach(([category, categoryData]) => {
            chatbotScript[`department_${brand}_${category}`] = {
                id: `department_${brand}_${category}`,
                message: `Please select a department for ${category}:`,
                options: Object.keys(categoryData.departments).map(department => ({
                    text: department,
                    nextId: `subdepartment_${brand}_${category}_${department}`
                })).concat({ text: "Back to categories", nextId: `category_${brand}` })
            };

            // Create subdepartment nodes for each department
            Object.entries(categoryData.departments).forEach(([department, departmentData]) => {
                chatbotScript[`subdepartment_${brand}_${category}_${department}`] = {
                    id: `subdepartment_${brand}_${category}_${department}`,
                    message: `Select a sub-department for ${department}:`,
                    options: departmentData.subDepartments.map(subDepartment => ({
                        text: subDepartment,
                        nextId: "result"
                    })).concat({ text: "Back to departments", nextId: `department_${brand}_${category}` })
                };
            });
        });
    });

    // Add result node to show selection summary
    chatbotScript.result = {
        id: 'result',
        message: (selection) => {
            if (!selection) {
                return "Error: No selection data available";
            }
            // Store the selection for design generation
            lastSelection = selection;
            return `Your selections:
            
Brand: ${selection.brand}
Category: ${selection.category}
Department: ${selection.department}
Sub-Department: ${selection.subDepartment}

What would you like to do next?`;
        },
        options: [
            { 
                text: "Generate Design", 
                nextId: "generating_design",
                action: async () => {
                    try {
                        if (!lastSelection) {
                            throw new Error('No selection data available');
                        }
                        const design = await generateDesign(lastSelection);
                        return design;
                    } catch (error) {
                        console.error('Error generating design:', error);
                        throw error;
                    }
                }
            },
            { text: "Start New Search", nextId: "start" },
            { 
                text: "Back to Sub-Departments", 
                nextId: (selection) => {
                    if (!selection || !selection.brand || !selection.category || !selection.department) {
                        return "start";
                    }
                    return `subdepartment_${selection.brand}_${selection.category}_${selection.department}`;
                }
            }
        ]
    };

    // Add generating design node
    chatbotScript.generating_design = {
        id: 'generating_design',
        message: "Your design is being generated...",
        options: [
            { text: "Start New Search", nextId: "start" }
        ]
    };
};

// Helper function to get script by ID
export const getScriptById = (id) => {
    return chatbotScript[id] || chatbotScript.start;
};