import { useState, useEffect, useRef } from 'react';
import { chatbotScript, getScriptById, initializeMaintenanceData, getBrandDescription } from './chatbotScript';
import { generateDesign, tweakDesign, postDesign, postMultipleDesigns } from '../../api/maintenanceEndpoints';
import Message from './../Message/Message';
import DatePickerMessage from './../DatePickerMessage/DatePickerMessage';
import NumberInputMessage from './../NumberInputMessage/NumberInputMessage';
import TableMessage from './../TableMessage/TableMessage';
import OptionButton from './../OptionButton/OptionButton';
import ThemeToggle from './../ThemeToggle/ThemeToggle';
import TypingIndicator from './../TypingIndicator/TypingIndicator';
import ScrollToBottom from './../ScrollToBottom/ScrollToBottom';
import ConfirmDialog from './../ConfirmDialog/ConfirmDialog';
import Toast from './../Toast/Toast';
import SelectionSummary from './../SelectionSummary/SelectionSummary';
import VariationSelectionModal from './../VariationSelectionModal/VariationSelectionModal';
import './Chatbot.css';

const Chatbot = () => {
  const [currentScriptId, setCurrentScriptId] = useState('brand');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [currentViewedImageUrl, setCurrentViewedImageUrl] = useState(null);
  const [currentDesignContext, setCurrentDesignContext] = useState(null); // { baseDesignIndex, variationIndex }
  const [currentDesignMetadata, setCurrentDesignMetadata] = useState(null); // Store metadata from API response
  const [addedToLarkImages, setAddedToLarkImages] = useState(new Set());
  const [currentSelection, setCurrentSelection] = useState({
    date: null,
    brand: null,
    category: null,
    department: null,
    subDepartment: null,
    numBaseDesigns: null,
    numVariationsPerBase: null
  }); 
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [showSelectionSummary, setShowSelectionSummary] = useState(true);
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [availableVariations, setAvailableVariations] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const handleVariationSubmit = async (selectedVariations) => {
    setShowVariationModal(false);
    setIsLoading(true);
    setLoadingMessage(`📤 Uploading ${selectedVariations.length} variation(s) to Lark...`);
    
    try {
      // Prepare variations array with metadata
      const variations = selectedVariations.map(img => {
        const variationData = {
          imageUrl: img.url,
          dominantColor: img.dominantColor,
          baseDesignNumber: img.baseDesignNumber,
          variationNumber: img.variationNumber,
          baseDesignDescription: img.baseDesignDescription
        };
        
        // Add metadata from currentDesignMetadata or currentSelection
        if (currentDesignMetadata) {
          variationData.targetReleaseDate = currentDesignMetadata.targetReleaseDate;
          variationData.brand = currentDesignMetadata.brand;
          variationData.brandDescription = currentDesignMetadata.brandDescription;
          variationData.category = currentDesignMetadata.category;
          variationData.department = currentDesignMetadata.department;
          variationData.subDepartment = currentDesignMetadata.subDepartment;
        } else {
          const brandDescription = getBrandDescription(currentSelection.brand);
          variationData.targetReleaseDate = currentSelection.date;
          variationData.brand = currentSelection.brand;
          variationData.brandDescription = brandDescription;
          variationData.category = currentSelection.category;
          variationData.department = currentSelection.department;
          variationData.subDepartment = currentSelection.subDepartment;
        }
        
        return variationData;
      });
      
      console.log('Sending batch data to Lark:', JSON.stringify({ variations: variations.length }, null, 2));
      
      // Call batch upload API
      const batchResult = await postMultipleDesigns({ variations });
      
      console.log('Batch upload result:', batchResult);

      // Support apiClient interceptors that return `response.data` directly
      const resultData = batchResult?.data ?? batchResult;

      // Mark all successfully uploaded images as added to Lark
      if (resultData && resultData.results) {
        const successfulUrls = resultData.results
          .filter(r => r.success)
          .map((r) => variations[r.variationIndex]?.imageUrl)
          .filter(url => url);
        
        setAddedToLarkImages(prev => {
          const updated = new Set(prev);
          successfulUrls.forEach(url => updated.add(url));
          return updated;
        });
      }
      
      // Show success/partial success message
      const succeeded = (resultData && (resultData.succeeded || 0)) || 0;
      const failed = (resultData && (resultData.failed || 0)) || 0;
      
      if (failed === 0) {
        showToast(`Successfully added ${succeeded} design(s) to Lark!`, 'success');
      } else {
        showToast(`Added ${succeeded} design(s) to Lark, ${failed} failed`, 'warning');
        
        // Add error details to conversation history
        if (resultData && resultData.errors && resultData.errors.length > 0) {
          const errorMessage = `Some designs failed to upload:\n${resultData.errors.map(e => 
            `- Variation ${e.variationNumber}: ${e.error}`
          ).join('\n')}`;
          
          setConversationHistory(prev => [
            ...prev,
            {
              type: 'bot',
              message: errorMessage,
              timestamp: new Date()
            }
          ]);
        }
      }
      
    } catch (error) {
      console.error('Error adding designs to Lark:', error);
      
      let errorMessage = 'Error adding designs to Lark: ';
      
      if (error.response) {
        errorMessage += `Server responded with error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
      } else if (error.request) {
        errorMessage += 'No response from server. Please check your internet connection.';
      } else {
        errorMessage += error.message || 'Unknown error occurred';
      }
      
      setConversationHistory(prev => [
        ...prev,
        {
          type: 'bot',
          message: errorMessage,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleResetClick = () => {
    setShowConfirmDialog(true);
  };

  const confirmReset = () => {
    resetConversation();
    setShowConfirmDialog(false);
    showToast('Conversation cleared', 'info');
  };

  const handleOptionClick = async (option) => {
    // Update selection based on the current script ID
    const updateSelection = () => {
      if (currentScriptId === 'brand') {
        if (option.text.startsWith('Skip')) {
          setCurrentSelection(prev => ({ ...prev, brand: 'Any' }));
        } else {
          setCurrentSelection(prev => ({ ...prev, brand: option.text }));
        }
      } else if (currentScriptId.startsWith('category_')) {
        if (option.text.startsWith('Skip')) {
          setCurrentSelection(prev => ({ ...prev, category: 'Any' }));
        } else {
          setCurrentSelection(prev => ({ ...prev, category: option.text }));
        }
      } else if (currentScriptId.startsWith('department_')) {
        if (option.text.startsWith('Skip')) {
          setCurrentSelection(prev => ({ ...prev, department: 'Any' }));
        } else {
          setCurrentSelection(prev => ({ ...prev, department: option.text }));
        }
      } else if (currentScriptId.startsWith('subdepartment_')) {
        if (option.text.startsWith('Skip')) {
          setCurrentSelection(prev => ({ ...prev, subDepartment: 'Any' }));
        } else {
          setCurrentSelection(prev => ({ ...prev, subDepartment: option.text }));
        }
      } else if (currentScriptId === 'number_of_designs') {
        // Extract number from text like "3 Designs" -> 3
        const number = parseInt(option.text.split(' ')[0]);
        setCurrentSelection(prev => ({ ...prev, numBaseDesigns: number }));
      }
    };

    // Don't update selection if it's a "Back" option
    if (!option.text.startsWith('Back')) {
      updateSelection();
    }

    // Special actions that should not add messages to history
    const silentActions = ["Add Variation to Lark", "Add Multiple to Lark", "Generate Design", "Generate Design Again", "Start New Search"];
    const isSilentAction = silentActions.includes(option.text);

    // Add current message and user's choice to history (unless it's a silent action)
    if (!isSilentAction) {
      const currentScript = getScriptById(currentScriptId);
      const newHistory = [
        ...conversationHistory,
        {
          type: 'bot',
          message: typeof currentScript.message === 'function' 
            ? currentScript.message(currentSelection) 
            : currentScript.message,
          timestamp: new Date()
        },
        {
          type: 'user',
          message: option.text,
          timestamp: new Date()
        }
      ];

      setConversationHistory(newHistory);
    }

    // Handle Generate Design action
    if (option.text === "Generate Design" || option.text === "Generate Design Again") {
      setIsLoading(true);
      setLoadingMessage('🎨 Analyzing your preferences...');
      
      // Simulate loading phases for better UX
      setTimeout(() => setLoadingMessage('🤖 AI is crafting your design...'), 2000);
      setTimeout(() => setLoadingMessage('✨ Adding final touches...'), 8000);
      
      try {
        // Get brand description
        const brandDescription = getBrandDescription(currentSelection.brand);
        
        // Convert currentSelection to JSON and call generateDesign
        const selectionJSON = {
          targetReleaseDate: currentSelection.date,
          numBaseDesigns: currentSelection.numBaseDesigns,
          numVariationsPerBase: currentSelection.numVariationsPerBase,
          brand: currentSelection.brand,
          brandDescription: brandDescription,
          category: currentSelection.category,
          department: currentSelection.department,
          subDepartment: currentSelection.subDepartment
        };
        
        console.log('Sending selection data:', JSON.stringify(selectionJSON, null, 2));
        
        const designResult = await generateDesign(selectionJSON);
        
        console.log('Design generation result:', designResult);
        
        // Extract and organize images from the response structure
        let images = null;
        let designs = null; // For tabbed view (base designs with variations)
        
        if (designResult?.images && Array.isArray(designResult.images)) {
          // Check if images have baseDesign property for grouping
          const hasBaseDesign = designResult.images.some(img => img.baseDesign !== undefined);
          
          if (hasBaseDesign) {
            // Group images by base design
            const groupedDesigns = {};
            designResult.images.forEach(img => {
              const baseId = img.baseDesign || 0;
              if (!groupedDesigns[baseId]) {
                groupedDesigns[baseId] = [];
              }
              groupedDesigns[baseId].push(img);
            });
            
            // Convert to array of design objects
            designs = Object.keys(groupedDesigns)
              .sort((a, b) => Number(a) - Number(b))
              .map(baseId => ({
                baseDesign: Number(baseId),
                variations: groupedDesigns[baseId]
              }));
            
            // Also create flat array for backward compatibility
            images = designResult.images.map(img => img.url);
            console.log('Extracted grouped designs:', designs);
          } else {
            // No base design grouping, treat as single set of variations
            images = designResult.images.map(img => img.url);
            console.log('Extracted images from new format:', images);
          }
        } else {
          // Fallback to old formats
          const imageUrl = designResult?.imageUrl || designResult?.imageURL || designResult?.image_url || designResult?.url;
          const imageUrls = designResult?.imageUrls || designResult?.imageURLs || designResult?.image_urls || designResult?.urls;
          images = imageUrls || (imageUrl ? [imageUrl] : null);
          console.log('Extracted images from legacy format:', images);
        }
        
        console.log('Final images array:', images);
        console.log('Final designs structure:', designs);
        
        // Store metadata from API response for later use (e.g., posting to Lark)
        if (designResult?.metadata) {
          setCurrentDesignMetadata(designResult.metadata);
          console.log('Stored design metadata:', designResult.metadata);
        }
        
        if ((images && images.length > 0) || designs) {
          // Add success message with image(s) to history
          let successMessage;
          if (designs && designs.length > 1) {
            const totalVariations = designs.reduce((sum, d) => sum + d.variations.length, 0);
            successMessage = `Design generated successfully! Here are ${designs.length} base designs with ${totalVariations} total variations:`;
          } else if (images && images.length > 1) {
            successMessage = `Design generated successfully! Here are your ${images.length} design variations:`;
          } else {
            successMessage = 'Design generated successfully! Here is your design:';
          }
          
          // Store the first image as the currently viewed image
          const firstImageUrl = designs ? designs[0]?.variations[0]?.url : images[0];
          setCurrentViewedImageUrl(firstImageUrl);
          
          setConversationHistory(prev => [
            ...prev,
            {
              type: 'bot',
              message: successMessage,
              imageUrls: images,
              imageMetadata: designResult?.images, // Store full metadata for variation numbers
              designs: designs, // Store grouped designs for tabbed view
              timestamp: new Date()
            }
          ]);
        } else {
          // Add success message without image (fallback)
          setConversationHistory(prev => [
            ...prev,
            {
              type: 'bot',
              message: `Design generated successfully!\n\nResult: ${JSON.stringify(designResult, null, 2)}`,
              timestamp: new Date()
            }
          ]);
        }
        
        setCurrentScriptId('design_complete');
        // Don't reset addedToLarkImages when generating new designs
      } catch (error) {
        setLoadingMessage('');
        console.error('Error generating design:', error);
        
        // Determine error message based on error type
        let errorMessage = 'Error generating design: ';
        
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          errorMessage += 'Request timed out. The design generation is taking longer than expected. Please try again.';
        } else if (error.response) {
          errorMessage += `Server responded with error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
        } else if (error.request) {
          errorMessage += 'No response from server. Please check your internet connection.';
        } else {
          errorMessage += error.message || 'Unknown error occurred';
        }
        
        // Add error message to history
        setConversationHistory(prev => [
          ...prev,
          {
            type: 'bot',
            message: errorMessage,
            timestamp: new Date()
          }
        ]);
        
        setCurrentScriptId('design_error');
      } finally {
        setIsLoading(false);
        setLoadingMessage('');
      }
    } else if (option.text === "Add Variation to Lark") {
      // Handle Add to Lark action
      setIsLoading(true);
      setLoadingMessage('📤 Uploading design to Lark...');
      try {
        // Find dominant color for the currently viewed image
        let dominantColor = null;
        
        // Search through conversation history to find the image metadata
        for (let i = conversationHistory.length - 1; i >= 0; i--) {
          const entry = conversationHistory[i];
          if (entry.imageMetadata && Array.isArray(entry.imageMetadata)) {
            // Find the specific image in metadata
            const imageData = entry.imageMetadata.find(img => img.url === currentViewedImageUrl);
            if (imageData && imageData.dominantColor) {
              dominantColor = imageData.dominantColor;
              console.log('Found dominant color for current image:', dominantColor);
              break;
            }
          }
        }
        
        // Use stored metadata from API response if available, otherwise fall back to currentSelection
        let larkData;
        
        if (currentDesignMetadata) {
          // Use metadata from the API response (more accurate - includes O1's selections)
          console.log('Using stored design metadata for Lark upload');
          larkData = {
            targetReleaseDate: currentDesignMetadata.targetReleaseDate,  // ISO 8601 format
            brand: currentDesignMetadata.brand,
            brandDescription: currentDesignMetadata.brandDescription,
            category: currentDesignMetadata.category,
            department: currentDesignMetadata.department,
            subDepartment: currentDesignMetadata.subDepartment,
            dominantColor: dominantColor, // Add dominant color for the specific image
            imageUrl: currentViewedImageUrl
          };
        } else {
          // Fallback to currentSelection (legacy behavior)
          console.log('No stored metadata found, using currentSelection for Lark upload');
          const brandDescription = getBrandDescription(currentSelection.brand);
          larkData = {
            targetReleaseDate: currentSelection.date,  // ISO 8601 format
            brand: currentSelection.brand,
            brandDescription: brandDescription,
            category: currentSelection.category,
            department: currentSelection.department,
            subDepartment: currentSelection.subDepartment,
            dominantColor: dominantColor, // Add dominant color for the specific image
            imageUrl: currentViewedImageUrl
          };
        }
        
        console.log('Sending data to Lark:', JSON.stringify(larkData, null, 2));
        
        const larkResult = await postDesign(larkData);
        
        console.log('Lark upload result:', larkResult);
        
        // Mark this specific image as added to Lark
        setAddedToLarkImages(prev => new Set([...prev, currentViewedImageUrl]));
        
        showToast('Design added to Lark successfully!', 'success');
        
        // Stay on design_complete screen
      } catch (error) {
        console.error('Error adding design to Lark:', error);
        
        // Only add error message to history
        let errorMessage = 'Error adding design to Lark: ';
        
        if (error.response) {
          errorMessage += `Server responded with error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
        } else if (error.request) {
          errorMessage += 'No response from server. Please check your internet connection.';
        } else {
          errorMessage += error.message || 'Unknown error occurred';
        }
        
        // Add error message to history
        setConversationHistory(prev => [
          ...prev,
          {
            type: 'bot',
            message: errorMessage,
            timestamp: new Date()
          }
        ]);
      } finally {
        setIsLoading(false);
        setLoadingMessage('');
      }
    } else if (option.text === "Add Multiple to Lark") {
      // Handle Add All to Lark action - open selection modal
      // Find all image metadata from conversation history
      let allImageMetadata = [];
      
      for (let i = conversationHistory.length - 1; i >= 0; i--) {
        const entry = conversationHistory[i];
        if (entry.imageMetadata && Array.isArray(entry.imageMetadata)) {
          allImageMetadata = entry.imageMetadata;
          console.log(`Found ${allImageMetadata.length} images for selection`);
          break;
        }
      }
      
      if (allImageMetadata.length === 0) {
        showToast('No images found to upload', 'error');
        return;
      }
      
      // Check if all are already uploaded
      const availableToUpload = allImageMetadata.filter(img => !addedToLarkImages.has(img.url));
      
      if (availableToUpload.length === 0) {
        showToast('All images have already been added to Lark!', 'info');
        return;
      }
      
      // Set available variations and open modal
      setAvailableVariations(allImageMetadata);
      setShowVariationModal(true);
    } else if (option.text === "Start New Search") {
      // Handle Start New Search - reset and restart without adding to history
      resetConversation();
    } else {
      // Normal navigation - show brief typing indicator
      setIsLoading(true);
      setLoadingMessage('');
      
      // Simulate brief "thinking" delay for better UX
      setTimeout(() => {
        const nextId = typeof option.nextId === 'function' ? option.nextId(currentSelection) : option.nextId;
        setCurrentScriptId(nextId);
        setIsLoading(false);
      }, 600);
    }
  };

  const handleDateSelect = (selectedDate) => {
    // Update selection with the chosen date
    setCurrentSelection(prev => ({ ...prev, date: selectedDate }));

    // Add messages to history
    const currentScript = getScriptById(currentScriptId);
    const newHistory = [
      ...conversationHistory,
      {
        type: 'bot',
        message: currentScript.message,
        timestamp: new Date()
      },
      {
        type: 'user',
        message: `Selected date: ${selectedDate}`,
        timestamp: new Date()
      }
    ];

    setConversationHistory(newHistory);

    // Show brief typing indicator
    setIsLoading(true);
    setLoadingMessage('');
    
    setTimeout(() => {
      setCurrentScriptId(currentScript.nextId);
      setIsLoading(false);
    }, 600);
  };

  const handleNumberSubmit = (number) => {
    const currentScript = getScriptById(currentScriptId);
    
    // Determine which number field we're updating based on current script ID
    if (currentScriptId === 'number_of_designs') {
      // Update selection with the number of designs
      setCurrentSelection(prev => ({ ...prev, numBaseDesigns: number }));
      
      // Add messages to history
      const newHistory = [
        ...conversationHistory,
        {
          type: 'bot',
          message: currentScript.message,
          timestamp: new Date()
        },
        {
          type: 'user',
          message: `${number} design${number !== 1 ? 's' : ''}`,
          timestamp: new Date()
        }
      ];
      
      setConversationHistory(newHistory);
    } else if (currentScriptId === 'number_of_variations') {
      // Update selection with the number of variations per base
      setCurrentSelection(prev => ({ ...prev, numVariationsPerBase: number }));
      
      // Add messages to history
      const newHistory = [
        ...conversationHistory,
        {
          type: 'bot',
          message: currentScript.message,
          timestamp: new Date()
        },
        {
          type: 'user',
          message: `${number} variation${number !== 1 ? 's' : ''} per base design`,
          timestamp: new Date()
        }
      ];
      
      setConversationHistory(newHistory);
    }

    // Show brief typing indicator
    setIsLoading(true);
    setLoadingMessage('');
    
    setTimeout(() => {
      setCurrentScriptId(currentScript.nextId);
      setIsLoading(false);
    }, 600);
  };

  const handleEditImage = async (editData) => {
    setIsLoading(true);
    setLoadingMessage('✏️ AI is editing your design...');

    try {
      // Prepare tweak request data
      const tweakRequestData = {
        imageUrl: editData.imageUrl,
        instruction: editData.instructions
      };
      
      console.log('Sending tweak request:', tweakRequestData);
      
      const tweakResult = await tweakDesign(tweakRequestData);
      
      console.log('Tweak result:', tweakResult);
      
      // Extract tweaked image URL
      const tweakedImageUrl = tweakResult?.tweakedImageUrl;
      
      if (tweakedImageUrl) {
        // Find and update the conversation history entry with the original images
        setConversationHistory(prev => {
          const updatedHistory = [...prev];
          
          // Find the last message with images or designs (should be the one we're editing)
          for (let i = updatedHistory.length - 1; i >= 0; i--) {
            // Handle designs structure (tabbed view)
            if (updatedHistory[i].designs && updatedHistory[i].designs.length > 0) {
              const updatedEntry = { ...updatedHistory[i] };
              updatedEntry.designs = JSON.parse(JSON.stringify(updatedEntry.designs)); // Deep copy
              
              // Find and update the specific variation
              let found = false;
              for (let design of updatedEntry.designs) {
                for (let j = 0; j < design.variations.length; j++) {
                  if (design.variations[j].url === editData.imageUrl) {
                    design.variations[j].url = tweakedImageUrl;
                    found = true;
                    break;
                  }
                }
                if (found) break;
              }
              
              // Also update imageMetadata if it exists
              if (updatedEntry.imageMetadata && updatedEntry.imageMetadata[editData.imageIndex]) {
                updatedEntry.imageMetadata = [...updatedEntry.imageMetadata];
                updatedEntry.imageMetadata[editData.imageIndex] = {
                  ...updatedEntry.imageMetadata[editData.imageIndex],
                  url: tweakedImageUrl
                };
              }
              
              // Also update flat imageUrls array if it exists
              if (updatedEntry.imageUrls && updatedEntry.imageUrls[editData.imageIndex]) {
                updatedEntry.imageUrls = [...updatedEntry.imageUrls];
                updatedEntry.imageUrls[editData.imageIndex] = tweakedImageUrl;
              }
              
              updatedHistory[i] = updatedEntry;
              break;
            }
            // Handle flat imageUrls structure (original carousel view)
            else if (updatedHistory[i].imageUrls && updatedHistory[i].imageUrls.length > 0) {
              // Create a copy of the entry
              const updatedEntry = { ...updatedHistory[i] };
              
              // Replace the image at the specified index
              updatedEntry.imageUrls = [...updatedEntry.imageUrls];
              updatedEntry.imageUrls[editData.imageIndex] = tweakedImageUrl;
              
              // Update metadata if it exists
              if (updatedEntry.imageMetadata && updatedEntry.imageMetadata[editData.imageIndex]) {
                updatedEntry.imageMetadata = [...updatedEntry.imageMetadata];
                updatedEntry.imageMetadata[editData.imageIndex] = {
                  ...updatedEntry.imageMetadata[editData.imageIndex],
                  url: tweakedImageUrl
                };
              }
              
              updatedHistory[i] = updatedEntry;
              break;
            }
          }
          
          // Return updated history without adding any new messages
          return updatedHistory;
        });
        
        // Update the currently viewed image if it was the one that got edited
        setCurrentViewedImageUrl(tweakedImageUrl);
      } else {
        // Only show message if there's an issue with the response
        setConversationHistory(prev => [
          ...prev,
          {
            type: 'bot',
            message: `Design tweaked but no image URL returned.\n\nResult: ${JSON.stringify(tweakResult, null, 2)}`,
            timestamp: new Date()
          }
        ]);
      }
      
    } catch (error) {
      console.error('Error tweaking design:', error);
      
      let errorMessage = 'Error tweaking design: ';
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage += 'Request timed out. Please try again.';
      } else if (error.response) {
        errorMessage += `Server responded with error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
      } else if (error.request) {
        errorMessage += 'No response from server. Please check your internet connection.';
      } else {
        errorMessage += error.message || 'Unknown error occurred';
      }
      
      setConversationHistory(prev => [
        ...prev,
        {
          type: 'bot',
          message: errorMessage,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleImageChange = (imageUrl, designContext = null) => {
    // Update the currently viewed image when user navigates the carousel
    setCurrentViewedImageUrl(imageUrl);
    // Update design context (baseDesignIndex and variationIndex)
    setCurrentDesignContext(designContext);
    // Note: We don't reset addedToLarkImages here - it's tracked per URL
  };

  const resetConversation = () => {
    setCurrentScriptId('brand');
    setConversationHistory([]);
    setCurrentViewedImageUrl(null);
    setCurrentDesignMetadata(null); // Clear stored metadata
    setAddedToLarkImages(new Set()); // Clear the set of added images
    setCurrentSelection({
      date: null,
      brand: null,
      category: null,
      department: null,
      subDepartment: null,
      numBaseDesigns: null,
      numVariationsPerBase: null
    });
  };

  // Initialize maintenance data when component mounts
  useEffect(() => {
    const initialize = async () => {
      await initializeMaintenanceData();
      setIsInitialized(true);
    };
    initialize();
  }, []);

  // Auto-scroll to bottom when conversation changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, currentScriptId]);

  const currentScript = getScriptById(currentScriptId);

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>DeeDee Assistant</h2>
        <div className="header-controls">
          <ThemeToggle />
          <button onClick={handleResetClick} className="reset-button">
            Clear
          </button>
        </div>
      </div>
      
      {/* Selection Summary - Always visible */}
      <SelectionSummary 
        currentSelection={currentSelection} 
        isVisible={showSelectionSummary}
        onToggle={() => setShowSelectionSummary(!showSelectionSummary)}
      />
      
      <div className="chatbot-messages" ref={messagesContainerRef}>
        {conversationHistory.map((entry, index) => {
          // Check if message is a table object
          if (entry.message && typeof entry.message === 'object' && entry.message.type === 'table') {
            return (
              <div key={index} className="message-wrapper bot-message-wrapper">
                <TableMessage data={entry.message.data} prompt={entry.message.prompt} />
              </div>
            );
          }
          
          return (
            <Message
              key={index}
              type={entry.type}
              message={entry.message}
              timestamp={entry.timestamp}
              imageUrl={entry.imageUrl}
              imageUrls={entry.imageUrls}
              imageMetadata={entry.imageMetadata}
              designs={entry.designs}
              onEditImage={entry.imageUrls || entry.designs ? handleEditImage : null}
              onImageChange={entry.imageUrls || entry.designs ? handleImageChange : null}
            />
          );
        })}
        
        {/* Current bot message */}
        {!isLoading && (
          <>
            {currentScript.type === 'datepicker' ? (
              <DatePickerMessage onDateSelect={handleDateSelect} />
            ) : currentScript.type === 'number_input' ? (
              <NumberInputMessage 
                onNumberSubmit={handleNumberSubmit}
                min={currentScript.min}
                max={currentScript.max}
                placeholder={currentScript.placeholder}
                message={currentScript.message}
                defaultValue={currentScript.defaultValue}
              />
            ) : (
              <>
                {(() => {
                  const messageContent = typeof currentScript.message === 'function' 
                    ? currentScript.message(currentSelection) 
                    : currentScript.message;
                  
                  // Check if message is a table object
                  if (messageContent && typeof messageContent === 'object' && messageContent.type === 'table') {
                    return (
                      <div className="message-wrapper bot-message-wrapper">
                        <TableMessage data={messageContent.data} prompt={messageContent.prompt} />
                      </div>
                    );
                  }
                  
                  return (
                    <Message
                      type="bot"
                      message={messageContent}
                      timestamp={new Date()}
                    />
                  );
                })()}
                
                {/* Options displayed inside chat */}
                {currentScript.options && (
                  <div className="chatbot-options-inline">
                    {currentScript.options.map((option, index) => (
                      <OptionButton
                        key={index}
                        text={option.text}
                        onClick={() => handleOptionClick(option)}
                        disabled={option.text === "Add to Lark" && addedToLarkImages.has(currentViewedImageUrl)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <TypingIndicator message={loadingMessage} />
        )}
        
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
        
        {/* Scroll to bottom button */}
        <ScrollToBottom 
          messagesContainerRef={messagesContainerRef}
          onClick={scrollToBottom}
        />
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Clear Conversation?"
        message="Are you sure you want to clear the entire conversation? This action cannot be undone."
        confirmText="Clear"
        cancelText="Cancel"
        onConfirm={confirmReset}
        onCancel={() => setShowConfirmDialog(false)}
      />

      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {/* Variation Selection Modal */}
      <VariationSelectionModal
        isOpen={showVariationModal}
        onClose={() => setShowVariationModal(false)}
        onSubmit={handleVariationSubmit}
        variations={availableVariations}
        addedToLarkImages={addedToLarkImages}
      />
    </div>
  );
};

export default Chatbot;