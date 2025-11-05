import { chatbotScript, initializeMaintenanceData } from '../chatbotScript';
import { getMaintenanceData, processMaintenanceData } from '../../../api/maintenanceEndpoints';

// Mock the API endpoints
jest.mock('../../../api/maintenanceEndpoints');

describe('ChatbotScript Updates', () => {
    const mockMaintenanceData = [
        {
            ID: 1,
            Category: "T-Shirt",
            Brand: "Nike",
            Department: "Men",
            SubDepartment: "Casual"
        },
        {
            ID: 2,
            Category: "Dress",
            Brand: "Zara",
            Department: "Ladies",
            SubDepartment: "Formal"
        }
    ];

    const processedData = {
        categories: ["T-Shirt", "Dress"],
        brands: ["Nike", "Zara"],
        departments: ["Men", "Ladies"],
        subDepartments: ["Casual", "Formal"]
    };

    beforeEach(() => {
        // Reset chatbotScript to initial state before each test
        jest.clearAllMocks();
        getMaintenanceData.mockResolvedValue(mockMaintenanceData);
        processMaintenanceData.mockReturnValue(processedData);
    });

    test('should update chatbotScript with maintenance data', async () => {
        await initializeMaintenanceData();

        // Test categories section
        expect(chatbotScript.categories).toBeDefined();
        expect(chatbotScript.categories.options).toHaveLength(processedData.categories.length + 1); // +1 for "Back to main menu"
        expect(chatbotScript.categories.options[0].text).toBe(processedData.categories[0]);

        // Test brands section
        expect(chatbotScript.brands).toBeDefined();
        expect(chatbotScript.brands.options).toHaveLength(processedData.brands.length + 1);
        expect(chatbotScript.brands.options[0].text).toBe(processedData.brands[0]);

        // Test departments section
        expect(chatbotScript.departments).toBeDefined();
        expect(chatbotScript.departments.options).toHaveLength(processedData.departments.length + 1);
        expect(chatbotScript.departments.options[0].text).toBe(processedData.departments[0]);

        // Test subDepartments section
        expect(chatbotScript.subDepartments).toBeDefined();
        expect(chatbotScript.subDepartments.options).toHaveLength(processedData.subDepartments.length + 1);
        expect(chatbotScript.subDepartments.options[0].text).toBe(processedData.subDepartments[0]);

        // Test start menu options
        expect(chatbotScript.start.options).toEqual([
            { text: "Browse by Category", nextId: "categories" },
            { text: "Browse by Brand", nextId: "brands" },
            { text: "Browse by Department", nextId: "departments" },
            { text: "Browse by Sub-Department", nextId: "subDepartments" }
        ]);
    });

    test('should handle empty maintenance data', async () => {
        processMaintenanceData.mockReturnValue({
            categories: [],
            brands: [],
            departments: [],
            subDepartments: []
        });

        await initializeMaintenanceData();

        // Verify each section has only the "Back to main menu" option
        expect(chatbotScript.categories.options).toHaveLength(1);
        expect(chatbotScript.categories.options[0].text).toBe("Back to main menu");

        expect(chatbotScript.brands.options).toHaveLength(1);
        expect(chatbotScript.brands.options[0].text).toBe("Back to main menu");

        expect(chatbotScript.departments.options).toHaveLength(1);
        expect(chatbotScript.departments.options[0].text).toBe("Back to main menu");

        expect(chatbotScript.subDepartments.options).toHaveLength(1);
        expect(chatbotScript.subDepartments.options[0].text).toBe("Back to main menu");
    });

    test('should handle API errors gracefully', async () => {
        const originalConsoleError = console.error;
        console.error = jest.fn();

        getMaintenanceData.mockRejectedValue(new Error('API Error'));

        await initializeMaintenanceData();

        expect(console.error).toHaveBeenCalledWith(
            'Error initializing maintenance data:',
            expect.any(Error)
        );

        console.error = originalConsoleError;
    });
});