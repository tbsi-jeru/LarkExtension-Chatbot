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
        message: "How many base designs would you like to generate? (Enter a number between 1 and 10)",
        type: 'number_input',
        nextId: 'number_of_variations',
        min: 1,
        max: 10,
        defaultValue: 3,
        placeholder: "Enter number of designs..."
    },
    number_of_variations: {
        id: 'number_of_variations',
        message: "How many variations would you like for each base design? (Enter a number between 1 and 5)",
        type: 'number_input',
        nextId: 'result',
        min: 1,
        max: 5,
        defaultValue: 3,
        placeholder: "Enter number of variations..."
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
    })).concat({ text: "Skip (Any Brand)", nextId: "category_any" });

    // Create "any" category node when brand is skipped
    chatbotScript.category_any = {
        id: 'category_any',
        message: 'Please select a category (or skip to continue):',
        options: [
            // Get all unique categories across all brands
            ...Array.from(new Set(
                Object.values(maintenanceData).flatMap(brandData => 
                    Object.keys(brandData.categories)
                )
            )).map(category => ({
                text: category,
                nextId: `department_any_${category}`
            })),
            { text: "Skip (Any Category)", nextId: "department_any_any" },
            { text: "Back to brands", nextId: "brand" }
        ]
    };

    // Create category nodes for each brand
    Object.entries(maintenanceData).forEach(([brand, brandData]) => {
        chatbotScript[`category_${brand}`] = {
            id: `category_${brand}`,
            message: `Please select a category from ${brand} (or skip to continue):`,
            options: Object.keys(brandData.categories).map(category => ({
                text: category,
                nextId: `department_${brand}_${category}`
            })).concat([
                { text: "Skip (Any Category)", nextId: `department_${brand}_any` },
                { text: "Back to brands", nextId: "brand" }
            ])
        };

        // Create department node when category is skipped for a specific brand
        chatbotScript[`department_${brand}_any`] = {
            id: `department_${brand}_any`,
            message: `Please select a department (or skip to continue):`,
            options: [
                ...Array.from(new Set(
                    Object.values(brandData.categories).flatMap(categoryData =>
                        Object.keys(categoryData.departments)
                    )
                )).map(department => ({
                    text: department,
                    nextId: `subdepartment_${brand}_any_${department}`
                })),
                { text: "Skip (Any Department)", nextId: `subdepartment_${brand}_any_any` },
                { text: "Back to categories", nextId: `category_${brand}` }
            ]
        };

        // Create department nodes for each category
        Object.entries(brandData.categories).forEach(([category, categoryData]) => {
            chatbotScript[`department_${brand}_${category}`] = {
                id: `department_${brand}_${category}`,
                message: `Please select a department for ${category} (or skip to continue):`,
                options: Object.keys(categoryData.departments).map(department => ({
                    text: department,
                    nextId: `subdepartment_${brand}_${category}_${department}`
                })).concat([
                    { text: "Skip (Any Department)", nextId: `subdepartment_${brand}_${category}_any` },
                    { text: "Back to categories", nextId: `category_${brand}` }
                ])
            };

            // Create subdepartment node when department is skipped for a specific category
            chatbotScript[`subdepartment_${brand}_${category}_any`] = {
                id: `subdepartment_${brand}_${category}_any`,
                message: `Select a sub-department (or skip to continue):`,
                options: [
                    ...Array.from(new Set(
                        Object.values(categoryData.departments).flatMap(departmentData =>
                            departmentData.subDepartments
                        )
                    )).map(subDepartment => ({
                        text: subDepartment,
                        nextId: "datepicker"
                    })),
                    { text: "Skip (Any Sub-Department)", nextId: "datepicker" },
                    { text: "Back to departments", nextId: `department_${brand}_${category}` }
                ]
            };

            // Create subdepartment nodes for each department
            Object.entries(categoryData.departments).forEach(([department, departmentData]) => {
                chatbotScript[`subdepartment_${brand}_${category}_${department}`] = {
                    id: `subdepartment_${brand}_${category}_${department}`,
                    message: `Select a sub-department for ${department} (or skip to continue):`,
                    options: departmentData.subDepartments.map(subDepartment => ({
                        text: subDepartment,
                        nextId: "datepicker"
                    })).concat([
                        { text: "Skip (Any Sub-Department)", nextId: "datepicker" },
                        { text: "Back to departments", nextId: `department_${brand}_${category}` }
                    ])
                };
            });
        });
    });

    // Create "any" department node when both brand and category are skipped
    chatbotScript.department_any_any = {
        id: 'department_any_any',
        message: 'Please select a department (or skip to continue):',
        options: [
            ...Array.from(new Set(
                Object.values(maintenanceData).flatMap(brandData =>
                    Object.values(brandData.categories).flatMap(categoryData =>
                        Object.keys(categoryData.departments)
                    )
                )
            )).map(department => ({
                text: department,
                nextId: `subdepartment_any_any_${department}`
            })),
            { text: "Skip (Any Department)", nextId: "subdepartment_any_any_any" },
            { text: "Back to categories", nextId: "category_any" }
        ]
    };

    // Create subdepartment nodes for when category is skipped
    Object.values(maintenanceData).forEach(brandData => {
        Object.entries(brandData.categories).forEach(([category, categoryData]) => {
            const categoryKey = `department_any_${category}`;
            if (!chatbotScript[categoryKey]) {
                chatbotScript[categoryKey] = {
                    id: categoryKey,
                    message: `Please select a department for ${category} (or skip to continue):`,
                    options: Object.keys(categoryData.departments).map(department => ({
                        text: department,
                        nextId: `subdepartment_any_${category}_${department}`
                    })).concat([
                        { text: "Skip (Any Department)", nextId: `subdepartment_any_${category}_any` },
                        { text: "Back to categories", nextId: "category_any" }
                    ])
                };
            }

            // Create subdepartment nodes for each department when category is specified but brand is not
            Object.entries(categoryData.departments).forEach(([department, departmentData]) => {
                const subDeptKey = `subdepartment_any_${category}_${department}`;
                if (!chatbotScript[subDeptKey]) {
                    chatbotScript[subDeptKey] = {
                        id: subDeptKey,
                        message: `Select a sub-department for ${department} (or skip to continue):`,
                        options: departmentData.subDepartments.map(subDepartment => ({
                            text: subDepartment,
                            nextId: "datepicker"
                        })).concat([
                            { text: "Skip (Any Sub-Department)", nextId: "datepicker" },
                            { text: "Back to departments", nextId: `department_any_${category}` }
                        ])
                    };
                }
            });

            // Create subdepartment node when department is skipped
            const skipSubDeptKey = `subdepartment_any_${category}_any`;
            if (!chatbotScript[skipSubDeptKey]) {
                chatbotScript[skipSubDeptKey] = {
                    id: skipSubDeptKey,
                    message: `Select a sub-department (or skip to continue):`,
                    options: [
                        ...Array.from(new Set(
                            Object.values(categoryData.departments).flatMap(departmentData =>
                                departmentData.subDepartments
                            )
                        )).map(subDepartment => ({
                            text: subDepartment,
                            nextId: "datepicker"
                        })),
                        { text: "Skip (Any Sub-Department)", nextId: "datepicker" },
                        { text: "Back to departments", nextId: `department_any_${category}` }
                    ]
                };
            }
        });
    });

    // Create subdepartment nodes for when both brand and category are skipped
    Array.from(new Set(
        Object.values(maintenanceData).flatMap(brandData =>
            Object.values(brandData.categories).flatMap(categoryData =>
                Object.keys(categoryData.departments)
            )
        )
    )).forEach(department => {
        const subDeptKey = `subdepartment_any_any_${department}`;
        chatbotScript[subDeptKey] = {
            id: subDeptKey,
            message: `Select a sub-department for ${department} (or skip to continue):`,
            options: [
                ...Array.from(new Set(
                    Object.values(maintenanceData).flatMap(brandData =>
                        Object.values(brandData.categories).flatMap(categoryData =>
                            categoryData.departments[department]?.subDepartments || []
                        )
                    )
                )).map(subDepartment => ({
                    text: subDepartment,
                    nextId: "datepicker"
                })),
                { text: "Skip (Any Sub-Department)", nextId: "datepicker" },
                { text: "Back to departments", nextId: "department_any_any" }
            ]
        };
    });

    // Create subdepartment node when all previous selections are skipped
    chatbotScript.subdepartment_any_any_any = {
        id: 'subdepartment_any_any_any',
        message: 'Select a sub-department (or skip to continue):',
        options: [
            ...Array.from(new Set(
                Object.values(maintenanceData).flatMap(brandData =>
                    Object.values(brandData.categories).flatMap(categoryData =>
                        Object.values(categoryData.departments).flatMap(departmentData =>
                            departmentData.subDepartments
                        )
                    )
                )
            )).map(subDepartment => ({
                text: subDepartment,
                nextId: "datepicker"
            })),
            { text: "Skip (Any Sub-Department)", nextId: "datepicker" },
            { text: "Back to departments", nextId: "department_any_any" }
        ]
    };

    // Create subdepartment nodes for brand + any category + specific department
    Object.entries(maintenanceData).forEach(([brand, brandData]) => {
        Array.from(new Set(
            Object.values(brandData.categories).flatMap(categoryData =>
                Object.keys(categoryData.departments)
            )
        )).forEach(department => {
            const subDeptKey = `subdepartment_${brand}_any_${department}`;
            chatbotScript[subDeptKey] = {
                id: subDeptKey,
                message: `Select a sub-department for ${department} (or skip to continue):`,
                options: [
                    ...Array.from(new Set(
                        Object.values(brandData.categories).flatMap(categoryData =>
                            categoryData.departments[department]?.subDepartments || []
                        )
                    )).map(subDepartment => ({
                        text: subDepartment,
                        nextId: "datepicker"
                    })),
                    { text: "Skip (Any Sub-Department)", nextId: "datepicker" },
                    { text: "Back to departments", nextId: `department_${brand}_any` }
                ]
            };
        });

        // Create subdepartment node when both category and department are skipped for a brand
        chatbotScript[`subdepartment_${brand}_any_any`] = {
            id: `subdepartment_${brand}_any_any`,
            message: `Select a sub-department (or skip to continue):`,
            options: [
                ...Array.from(new Set(
                    Object.values(brandData.categories).flatMap(categoryData =>
                        Object.values(categoryData.departments).flatMap(departmentData =>
                            departmentData.subDepartments
                        )
                    )
                )).map(subDepartment => ({
                    text: subDepartment,
                    nextId: "datepicker"
                })),
                { text: "Skip (Any Sub-Department)", nextId: "datepicker" },
                { text: "Back to departments", nextId: `department_${brand}_any` }
            ]
        };
    });

    // Add result node to show selection summary
    chatbotScript.result = {
        id: 'result',
        message: (selection) => {
            if (!selection) {
                return "Error: No selection data available";
            }
            return {
                type: 'table',
                data: [
                    { label: 'Target Release Date', value: selection.date },
                    { label: 'Number of Base Designs', value: selection.numBaseDesigns },
                    { label: 'Variations per Base', value: selection.numVariationsPerBase },
                    { label: 'Brand', value: selection.brand || 'Any' },
                    { label: 'Category', value: selection.category || 'Any' },
                    { label: 'Department', value: selection.department || 'Any' },
                    { label: 'Sub-Department', value: selection.subDepartment || 'Any' }
                ],
                prompt: 'What would you like to do next?'
            };
        },
        options: [
            { 
                text: "Generate Design", 
                nextId: "generating_design"
            },
            { text: "Start New Search", nextId: "brand" },
            { 
                text: "Back to Number of Variations", 
                nextId: "number_of_variations"
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