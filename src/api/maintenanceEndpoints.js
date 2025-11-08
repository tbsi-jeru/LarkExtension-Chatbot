import { apiClient } from './axiosConfig';

export const generateDesign = async (selectionData) => {
    try {
        const response = await apiClient.post('/db/generate-design', selectionData);
        return response;
    } catch (error) {
        console.error('Error generating design:', error);
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
        const { Brand, Category, Department, SubDepartment } = item;
        
        // Initialize brand if it doesn't exist
        if (!structure[Brand]) {
            structure[Brand] = {
                categories: {}
            };
        }

        // Initialize category if it doesn't exist
        if (!structure[Brand].categories[Category]) {
            structure[Brand].categories[Category] = {
                departments: {}
            };
        }

        // Initialize department if it doesn't exist
        if (!structure[Brand].categories[Category].departments[Department]) {
            structure[Brand].categories[Category].departments[Department] = {
                subDepartments: new Set()
            };
        }

        // Add subDepartment
        structure[Brand].categories[Category].departments[Department].subDepartments.add(SubDepartment);
    });

    // Convert Sets to arrays and create final structure
    return Object.entries(structure).reduce((acc, [brand, brandData]) => {
        acc[brand] = {
            categories: Object.entries(brandData.categories).reduce((catAcc, [category, categoryData]) => {
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