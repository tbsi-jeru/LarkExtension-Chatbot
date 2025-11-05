import { apiClient } from '../axiosConfig';
import { getMaintenanceData, processMaintenanceData } from '../maintenanceEndpoints';

// Mock the axios service
jest.mock('../axiosConfig', () => ({
    apiClient: {
        get: jest.fn()
    }
}));

describe('Maintenance Endpoints', () => {
    // Sample test data
    const mockMaintenanceData = [
        {
            "ID": 1,
            "Category": "T-Shirt",
            "Brand": "Nike",
            "Department": "Men",
            "SubDepartment": "Casual"
        },
        {
            "ID": 2,
            "Category": "Dress",
            "Brand": "Zara",
            "Department": "Ladies",
            "SubDepartment": "Formal"
        },
        {
            "ID": 3,
            "Category": "T-Shirt", // Duplicate category to test unique values
            "Brand": "Nike", // Duplicate brand to test unique values
            "Department": "Men", // Duplicate department to test unique values
            "SubDepartment": "Casual" // Duplicate subdepartment to test unique values
        }
    ];

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('getMaintenanceData', () => {
        it('should fetch maintenance data successfully', async () => {
            // Setup
            apiClient.get.mockResolvedValue(mockMaintenanceData);

            // Execute
            const result = await getMaintenanceData();

            // Assert
            expect(apiClient.get).toHaveBeenCalledWith('/maintenance');
            expect(result).toEqual(mockMaintenanceData);
        });

        it('should handle API errors properly', async () => {
            // Setup
            const mockError = new Error('API Error');
            apiClient.get.mockRejectedValue(mockError);

            // Execute & Assert
            await expect(getMaintenanceData()).rejects.toThrow('API Error');
        });
    });

    describe('processMaintenanceData', () => {
        it('should process data and return unique values for each field', () => {
            // Execute
            const result = processMaintenanceData(mockMaintenanceData);

            // Assert
            expect(result).toEqual({
                categories: ['T-Shirt', 'Dress'],
                brands: ['Nike', 'Zara'],
                departments: ['Men', 'Ladies'],
                subDepartments: ['Casual', 'Formal']
            });
        });

        it('should handle empty data array', () => {
            // Execute
            const result = processMaintenanceData([]);

            // Assert
            expect(result).toEqual({
                categories: [],
                brands: [],
                departments: [],
                subDepartments: []
            });
        });

        it('should handle null or undefined values in data', () => {
            // Setup
            const dataWithNulls = [
                {
                    ID: 1,
                    Category: null,
                    Brand: undefined,
                    Department: 'Men',
                    SubDepartment: 'Casual'
                },
                {
                    ID: 2,
                    Category: 'T-Shirt',
                    Brand: 'Nike',
                    Department: 'Men',
                    SubDepartment: 'Casual'
                }
            ];

            // Execute
            const result = processMaintenanceData(dataWithNulls);

            // Assert
            expect(result).toEqual({
                categories: ['T-Shirt'],
                brands: ['Nike'],
                departments: ['Men'],
                subDepartments: ['Casual']
            });
        });
    });
});