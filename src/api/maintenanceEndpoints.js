import { apiClient } from './axiosConfig';

export const postDesign = async (selectionData) => {
    try {
        const response = await apiClient.post('/lark/upload', selectionData);
        return response;
    } catch (error) {
        console.error('Error posting design to Lark:', error);
        throw error;
    }
};

export const postMultipleDesigns = async (variationsData) => {
    try {
        const response = await apiClient.post('/lark/upload-batch', variationsData);
        return response;
    } catch (error) {
        console.error('Error posting multiple designs to Lark:', error);
        throw error;
    }
};

export const generateDesign = async (selectionData) => {
    try {
        const response = await apiClient.post('/ai/ai-generateImage', selectionData);
        return response;
    } catch (error) {
        console.error('Error generating design:', error);
        throw error;
    }
};

export const tweakDesign = async (data) => {
    try {
        const response = await apiClient.post('/ai/ai-tweakImage', data);
        return response;
    } catch (error) {
        console.error('Error tweaking design:', error);
        throw error;
    }
};

export const editDesign = async (editData) => {
    try {
        const response = await apiClient.post('/ai/ai-editImage', editData);
        return response;
    } catch (error) {
        console.error('Error editing design:', error);
        throw error;
    }
};

export const getMaintenanceData = async () => {
    try {
        const data = await apiClient.get('/db/maintenance');
        return data;
    } catch (error) {
        console.error('Error fetching maintenance data:', error);
        throw error;
    }
};

export const processMaintenanceData = (data) => {
    const structure = {};

    // Create hierarchical structure
    data.forEach(item => {
        const { U_Brand, Name, U_Department, U_Sub_Department, BrandDesc } = item;
        
        // Initialize brand if it doesn't exist
        if (!structure[U_Brand]) {
            structure[U_Brand] = {
                description: BrandDesc || '',
                categories: {}
            };
        }

        // Initialize category if it doesn't exist
        if (!structure[U_Brand].categories[Name]) {
            structure[U_Brand].categories[Name] = {
                departments: {}
            };
        }

        // Initialize department if it doesn't exist
        if (!structure[U_Brand].categories[Name].departments[U_Department]) {
            structure[U_Brand].categories[Name].departments[U_Department] = {
                subDepartments: new Set()
            };
        }

        // Add subDepartment
        structure[U_Brand].categories[Name].departments[U_Department].subDepartments.add(U_Sub_Department);
    });

    // Convert Sets to arrays and create final structure
    return Object.entries(structure).reduce((acc, [U_Brand, U_BrandData]) => {
        acc[U_Brand] = {
            description: U_BrandData.description,
            categories: Object.entries(U_BrandData.categories).reduce((catAcc, [category, categoryData]) => {
                catAcc[category] = {
                    departments: Object.entries(categoryData.departments).reduce((deptAcc, [department, departmentData]) => {
                        deptAcc[department] = {
                            subDepartments: Array.from(departmentData.subDepartments)
                        };
                        return deptAcc;
                    }, {})
                };
                return catAcc;
            }, {})
        };
        return acc;
    }, {});
};