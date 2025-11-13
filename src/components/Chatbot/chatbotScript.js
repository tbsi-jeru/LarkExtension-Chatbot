import { getMaintenanceData, processMaintenanceData } from '../../api/maintenanceEndpoints';

// Initialize maintenance data
let maintenanceData = {};

// Chatbot script data structure - minimal initial state
export const chatbotScript = {
    brand: {
        id: 'brand',
        message: "Hello! I'm your DeeDee assistant. Please select a brand to start:",
        options: [] // Will be populated by updateChatbotScript
    },
    datepicker: {
        id: 'datepicker',
        message: "When do you plan to release the new designs?:",
        type: 'datepicker',
        nextId: 'number_of_designs'
    },
    number_of_designs: {
        id: 'number_of_designs',
        message: "How many base designs would you like to generate?",
        options: [
            { text: "1 Design", nextId: "result" },
            { text: "2 Designs", nextId: "result" },
            { text: "3 Designs", nextId: "result" },
            { text: "4 Designs", nextId: "result" },
            { text: "5 Designs", nextId: "result" }
        ]
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
    // Reset brand options with available brands
    chatbotScript.brand.options = Object.keys(maintenanceData).map(brand => ({
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
            })).concat({ text: "Back to brands", nextId: "brand" })
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
                        nextId: "datepicker"
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
            return `Your selections:
Target Release Date: ${selection.date}
Number of Designs: ${selection.numBaseDesigns || 'Not specified'}
Brand: ${selection.brand}
Category: ${selection.category}
Department: ${selection.department}
Sub-Department: ${selection.subDepartment}

What would you like to do next?`;
        },
        options: [
            { 
                text: "Generate Design", 
                nextId: "generating_design"
            },
            { text: "Start New Search", nextId: "brand" },
            { 
                text: "Back to Number of Designs", 
                nextId: "number_of_designs"
            }
        ]
    };

    // Add design complete node
    chatbotScript.design_complete = {
        id: 'design_complete',
        message: "What would you like to do next?",
        options: [
            { text: "Start New Search", nextId: "brand" },
            { text: "Add to Lark", nextId: "brand" },
        ]
    };

    // Add design error node
    chatbotScript.design_error = {
        id: 'design_error',
        message: "Would you like to try again?",
        options: [
            { text: "Generate Design Again", nextId: "result" },
            { text: "Start New Search", nextId: "brand" }
        ]
    };
};

// Helper function to get script by ID
export const getScriptById = (id) => {
    return chatbotScript[id] || chatbotScript.brand;
};

// Helper function to get brand description
export const getBrandDescription = (brandName) => {
    return maintenanceData[brandName]?.description || '';
};