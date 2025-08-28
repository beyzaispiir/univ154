import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import * as XLSX from 'xlsx';
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdBorderAll,
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdFormatColorFill,
  MdFormatColorText,
  MdFunctions,
  MdAdd,
  MdDownload,
  MdSave,
  MdClose,
  MdContentCut,
  MdContentCopy,
  MdContentPaste,
  MdUpload,
  MdDelete,
  MdDescription,
  MdFolder,
  MdZoomOut,
  MdZoomIn,
  MdHeight,
  MdVisibilityOff,
  MdVisibility
} from 'react-icons/md';

const ExcelWorkshop = () => {
  const { user } = useAuth();
  const [activeCell, setActiveCell] = useState(null);
  const [cellValues, setCellValues] = useState({});
  const [formulaBarValue, setFormulaBarValue] = useState('');
  const [fontSize, setFontSize] = useState('11');
  const [fontFamily, setFontFamily] = useState('Calibri');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState('left');
  
  // New state for file management
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);

  // Add state for cell styles
  const [cellStyles, setCellStyles] = useState({});

  // Generate column headers (A, B, C, ...)
  const columns = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  // Generate row headers (1, 2, 3, ...)
  const VISIBLE_ROWS = 30; // Adjust this number based on screen size
  const rows = Array.from({ length: VISIBLE_ROWS }, (_, i) => i + 1);

  const [selectedCells, setSelectedCells] = useState({ start: null, end: null });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [sheets, setSheets] = useState([
    { 
      id: 1, 
      name: 'Sheet1',
      cellValues: {},
      cellStyles: {},
      selectedCells: { start: null, end: null },
      activeCell: null
    }
  ]);
  const [activeSheet, setActiveSheet] = useState(1);

  // Add state for row/column management
  const [customRows, setCustomRows] = useState(VISIBLE_ROWS);
  const [customColumns, setCustomColumns] = useState(
    Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
  );

  // Add this state for temporary zoom input
  const [zoomInput, setZoomInput] = useState(zoomLevel.toString());

  // Add style variables at the top of the component
  const zoomControlStyles = {
    container: {
      padding: '8px 16px',  // Adjustable padding
      borderRadius: '30px',  // More rounded corners
      gap: '16px',  // Space between elements
    },
    percentage: {
      fontSize: '14px',  // Adjustable font size for percentage
      minWidth: '48px',  // Adjustable width for percentage
    },
    buttons: {
      fontSize: '18px',  // Adjustable font size for +/- buttons
      padding: '6px 8px',  // Adjustable padding for buttons
    },
    reset: {
      fontSize: '13px',  // Adjustable font size for reset
      padding: '6px 12px',  // Adjustable padding for reset button
    }
  };

  // Add these new state and refs
  const gridContainerRef = useRef(null);
  const [viewportDimensions, setViewportDimensions] = useState({ width: 0, height: 0 });

  // Update the constants to match Excel's default behavior
  const BASE_CELL_WIDTH = 100;    // Base width at 100% zoom
  const BASE_CELL_HEIGHT = 25;    // Base height at 100% zoom
  const MIN_COLUMNS = 20;         // Default visible columns (A to T)
  const MAX_COLUMNS = 26;         // Maximum extend to Z initially
  const MIN_ROWS = 40;           // Default visible rows
  const MAX_ROWS = 100;          // Reasonable maximum for initial view
  const BUFFER_CELLS = 2;        // Small buffer for smooth scrolling

  // Update the updateGridDimensions function with Excel-like behavior
  const updateGridDimensions = useCallback(() => {
    if (!gridContainerRef.current) return;

    const container = gridContainerRef.current;
    const containerHeight = container.clientHeight;
    const containerWidth = container.clientWidth;

    // Calculate visible area based on zoom level
    const visibleWidth = containerWidth / (zoomLevel / 100);
    const visibleHeight = containerHeight / (zoomLevel / 100);

    // Calculate cells that would fit in the viewport
    const fittingColumns = Math.ceil(visibleWidth / BASE_CELL_WIDTH);
    const fittingRows = Math.ceil(visibleHeight / BASE_CELL_HEIGHT);

    // Maintain Excel-like ratio between rows and columns
    // Excel typically shows around 20 columns (A-T) when showing ~40 rows
    const baseColumnRatio = 20 / 40; // Excel's typical ratio
    const targetColumns = Math.round(fittingRows * baseColumnRatio) + BUFFER_CELLS;

    // Calculate needed dimensions with Excel-like limits
    const neededColumns = Math.min(
      MAX_COLUMNS,
      Math.max(MIN_COLUMNS, Math.min(targetColumns, fittingColumns))
    );

    const neededRows = Math.min(
      MAX_ROWS,
      Math.max(MIN_ROWS, fittingRows + BUFFER_CELLS)
    );

    // Update dimensions with debouncing
    setCustomRows(prev => {
      const diff = Math.abs(prev - neededRows);
      return diff > 2 ? neededRows : prev;
    });

    setCustomColumns(prev => {
      const targetColumnCount = neededColumns;
      if (Math.abs(prev.length - targetColumnCount) <= 1) return prev;
      
      if (prev.length > targetColumnCount) {
        return prev.slice(0, targetColumnCount);
      } else {
        const newColumns = [...prev];
        while (newColumns.length < targetColumnCount) {
          const lastCol = newColumns[newColumns.length - 1];
          newColumns.push(getNextColumnLetter(lastCol));
        }
        return newColumns;
      }
    });
  }, [zoomLevel]);

  // Add performance optimization for scroll handling
  useEffect(() => {
    const container = gridContainerRef.current;
    if (!container) return;

    let scrollTimeout;
    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        updateGridDimensions();
      }, 100); // Debounce scroll updates
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [updateGridDimensions]);

  // Add helper function to get next column letter
  const getNextColumnLetter = (currentCol) => {
    const lastChar = currentCol.slice(-1);
    const prefix = currentCol.slice(0, -1);
    
    if (lastChar === 'Z') {
      return prefix ? getNextColumnLetter(prefix) + 'A' : 'AA';
    }
    return prefix + String.fromCharCode(lastChar.charCodeAt(0) + 1);
  };

  // Add effect to update dimensions on zoom change or resize
  useEffect(() => {
    const handleResize = () => {
      updateGridDimensions();
    };

    // Initial update
    updateGridDimensions();

    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateGridDimensions]);

  // Insert row/column functions
  const insertRow = (afterIndex) => {
    setCustomRows(prev => prev + 1);
    
    // Shift existing cell values down
    setSheets(prevSheets => {
      return prevSheets.map(sheet => {
        if (sheet.id !== activeSheet) return sheet;

        const newCellValues = {};
        const newCellStyles = {};

        Object.entries(sheet.cellValues).forEach(([cellId, value]) => {
          const [col, row] = [cellId.match(/[A-Z]+/)[0], parseInt(cellId.match(/\d+/)[0])];
          if (row > afterIndex) {
            newCellValues[`${col}${row + 1}`] = value;
            if (sheet.cellStyles[cellId]) {
              newCellStyles[`${col}${row + 1}`] = sheet.cellStyles[cellId];
            }
          } else {
            newCellValues[cellId] = value;
            if (sheet.cellStyles[cellId]) {
              newCellStyles[cellId] = sheet.cellStyles[cellId];
            }
          }
        });

        return {
          ...sheet,
          cellValues: newCellValues,
          cellStyles: newCellStyles
        };
      });
    });
  };

  const insertColumn = (afterCol) => {
    const afterIndex = customColumns.indexOf(afterCol);
    
    // Get next available column letter
    const getNextColumnLetter = (currentCol) => {
      const lastChar = currentCol.slice(-1);
      const prefix = currentCol.slice(0, -1);
      
      if (lastChar === 'Z') {
        return prefix ? getNextColumnLetter(prefix) + 'A' : 'AA';
      }
      return prefix + String.fromCharCode(lastChar.charCodeAt(0) + 1);
    };

    const newCol = getNextColumnLetter(afterCol);
    
    setCustomColumns(prev => [
      ...prev.slice(0, afterIndex + 1),
      newCol,
      ...prev.slice(afterIndex + 1).map(col => getNextColumnLetter(col))
    ]);

    // Shift existing cell values right
    setSheets(prevSheets => {
      return prevSheets.map(sheet => {
        if (sheet.id !== activeSheet) return sheet;

        const newCellValues = {};
        const newCellStyles = {};

        // Process cells from right to left to avoid overwriting
        [...customColumns].reverse().forEach(col => {
          const colIndex = customColumns.indexOf(col);
          if (colIndex > afterIndex) {
            Object.entries(sheet.cellValues).forEach(([cellId, value]) => {
              const [currentCol, row] = [cellId.match(/[A-Z]+/)[0], cellId.match(/\d+/)[0]];
              if (currentCol === col) {
                const nextCol = getNextColumnLetter(col);
                newCellValues[`${nextCol}${row}`] = value;
                if (sheet.cellStyles[cellId]) {
                  newCellStyles[`${nextCol}${row}`] = sheet.cellStyles[cellId];
                }
              }
            });
          }
        });

        // Keep values for columns before the insertion point
        Object.entries(sheet.cellValues).forEach(([cellId, value]) => {
          const [col, row] = [cellId.match(/[A-Z]+/)[0], cellId.match(/\d+/)[0]];
          if (customColumns.indexOf(col) <= afterIndex) {
            newCellValues[cellId] = value;
            if (sheet.cellStyles[cellId]) {
              newCellStyles[cellId] = sheet.cellStyles[cellId];
            }
          }
        });

        return {
          ...sheet,
          cellValues: newCellValues,
          cellStyles: newCellStyles
        };
      });
    });
  };

  // Add delete functions
  const deleteRow = (rowIndex) => {
    setSheets(prevSheets => {
      return prevSheets.map(sheet => {
        if (sheet.id !== activeSheet) return sheet;

        const newCellValues = {};
        const newCellStyles = {};

        Object.entries(sheet.cellValues).forEach(([cellId, value]) => {
          const [col, row] = [cellId.match(/[A-Z]+/)[0], parseInt(cellId.match(/\d+/)[0])];
          if (row < rowIndex) {
            newCellValues[cellId] = value;
            if (sheet.cellStyles[cellId]) {
              newCellStyles[cellId] = sheet.cellStyles[cellId];
            }
          } else if (row > rowIndex) {
            newCellValues[`${col}${row - 1}`] = value;
            if (sheet.cellStyles[cellId]) {
              newCellStyles[`${col}${row - 1}`] = sheet.cellStyles[cellId];
            }
          }
        });

        return {
          ...sheet,
          cellValues: newCellValues,
          cellStyles: newCellStyles
        };
      });
    });
    setCustomRows(prev => prev - 1);
  };

  const deleteColumn = (col) => {
    const colIndex = customColumns.indexOf(col);
    
    setSheets(prevSheets => {
      return prevSheets.map(sheet => {
        if (sheet.id !== activeSheet) return sheet;

        const newCellValues = {};
        const newCellStyles = {};

        Object.entries(sheet.cellValues).forEach(([cellId, value]) => {
          const [currentCol, row] = [cellId.match(/[A-Z]+/)[0], cellId.match(/\d+/)[0]];
          const currentColIndex = customColumns.indexOf(currentCol);
          
          if (currentColIndex < colIndex) {
            newCellValues[cellId] = value;
            if (sheet.cellStyles[cellId]) {
              newCellStyles[cellId] = sheet.cellStyles[cellId];
            }
          } else if (currentColIndex > colIndex) {
            const prevCol = customColumns[currentColIndex - 1];
            newCellValues[`${prevCol}${row}`] = value;
            if (sheet.cellStyles[cellId]) {
              newCellStyles[`${prevCol}${row}`] = sheet.cellStyles[cellId];
            }
          }
        });

        return {
          ...sheet,
          cellValues: newCellValues,
          cellStyles: newCellStyles
        };
      });
    });

    setCustomColumns(prev => prev.filter((_, index) => index !== colIndex));
  };

  // Clear contents function
  const clearContents = (type, index) => {
    setSheets(prevSheets => {
      return prevSheets.map(sheet => {
        if (sheet.id !== activeSheet) return sheet;

        const newCellValues = { ...sheet.cellValues };
        const newCellStyles = { ...sheet.cellStyles };

        Object.keys(sheet.cellValues).forEach(cellId => {
          const [col, row] = [cellId.match(/[A-Z]+/)[0], parseInt(cellId.match(/\d+/)[0])];
          if ((type === 'row' && row === index) || 
              (type === 'column' && col === index)) {
            delete newCellValues[cellId];
            delete newCellStyles[cellId];
          }
        });

        return {
          ...sheet,
          cellValues: newCellValues,
          cellStyles: newCellStyles
        };
      });
    });
  };

  // Update context menu
  const getContextMenuItems = (type, index) => [
    {
      label: `Insert ${type === 'row' ? 'Row Below' : 'Column Right'}`,
      action: () => type === 'row' ? insertRow(index) : insertColumn(index),
      icon: <MdAdd className="text-gray-600" size={18} />
    },
    {
      label: `Delete ${type}`,
      action: () => type === 'row' ? deleteRow(index) : deleteColumn(index),
      icon: <MdDelete className="text-gray-600" size={18} />
    },
    {
      label: 'Clear Contents',
      action: () => clearContents(type, index),
      icon: <MdClose className="text-gray-600" size={18} />
    },
    {
      label: `${type} Height...`,
      action: () => console.log(`Adjust ${type} height/width`),
      icon: <MdHeight className="text-gray-600" size={18} />
    },
    {
      label: 'Hide',
      action: () => console.log(`Hide ${type}`),
      icon: <MdVisibilityOff className="text-gray-600" size={18} />
    },
    {
      label: 'Unhide',
      action: () => console.log(`Unhide ${type}`),
      icon: <MdVisibility className="text-gray-600" size={18} />
    }
  ];

  // Context menu for row/column operations
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    type: null, // 'row' or 'column'
    index: null
  });

  const handleHeaderContextMenu = (e, type, index) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      type,
      index
    });
  };

  // Update cell selection with proper mouse events
  const handleMouseDown = (row, col, e) => {
    e.preventDefault(); // Prevent text selection
    const cellId = `${col}${row}`;
    
    setDragStart(cellId);
    setDragEnd(cellId);
    setIsDragging(true);
    
    const newSelection = { start: cellId, end: cellId };
    setSelectedCells(newSelection);
    setActiveCell(cellId);

    // Update current sheet's selection
    setSheets(prevSheets => {
      return prevSheets.map(sheet => {
        if (sheet.id !== activeSheet) return sheet;
        return {
          ...sheet,
          selectedCells: newSelection,
          activeCell: cellId
        };
      });
    });
  };

  const handleGlobalMouseMove = (e) => {
    if (!isDragging) return;

    // Get the element under the cursor
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element) return;

    // Find the closest cell
    const cell = element.closest('td');
    if (!cell) return;

    // Extract row and column from the cell's position
    const row = cell.parentElement.rowIndex;
    const col = customColumns[cell.cellIndex - 1]; // -1 because of row headers
    
    if (row && col) {
      handleMouseEnter(row, col);
    }
  };

  const handleGlobalMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  };

  // Update the table rendering to include row/column headers with context menu
  const renderTable = () => (
    <table 
      className="border-collapse" 
      style={{ 
        tableLayout: 'fixed',
        width: 'fit-content',
        borderSpacing: 0
      }}
    >
      <colgroup>
        <col style={{ width: '40px' }} /> {/* Row header column */}
        {customColumns.map(col => (
          <col key={col} style={{ width: `${BASE_CELL_WIDTH}px` }} />
        ))}
      </colgroup>
      <thead className="sticky top-0 z-20 bg-gray-50">
        <tr>
          <th className="border border-gray-200" style={{ height: `${BASE_CELL_HEIGHT}px` }}></th>
          {customColumns.map(col => (
            <th
              key={col}
              className="border border-gray-200 px-2 py-1 font-semibold text-gray-700 relative"
              style={{ height: `${BASE_CELL_HEIGHT}px` }}
              onContextMenu={(e) => handleHeaderContextMenu(e, 'column', col)}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: customRows }, (_, i) => i + 1).map(row => (
          <tr key={row}>
            <th
              className="sticky left-0 z-10 bg-gray-50 border border-gray-200 px-2 py-1 font-semibold text-gray-700"
              style={{ height: `${BASE_CELL_HEIGHT}px` }}
              onContextMenu={(e) => handleHeaderContextMenu(e, 'row', row)}
            >
              {row}
            </th>
            {customColumns.map(col => renderCell(row, col))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  useEffect(() => {
    loadUserFiles();
  }, [user]);

  const loadUserFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('excel_files')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const createNewWorksheet = async () => {
    try {
      const fileName = `New Worksheet ${new Date().toLocaleString()}`;
      const newFile = {
        name: fileName,
        content: {},
        created_at: new Date().toISOString(),
        user_email: user.email
      };

      const { data, error } = await supabase
        .from('excel_files')
        .insert([newFile])
        .select()
        .single();

      if (error) throw error;

      setFiles(prev => [data, ...prev]);
      setActiveFile(data);
      setCellValues({});
    } catch (error) {
      console.error('Error creating new worksheet:', error);
    }
  };

  // Storage işlemleri için yeni fonksiyonlar
  const uploadToStorage = async (file, fileData) => {
    try {
      // Kullanıcı kontrolü
      if (!user || !user.email) {
        throw new Error('Please login to upload files');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.email}/${new Date().getTime()}.${fileExt}`;
      
      // Upload file to Storage
      const { error: uploadError } = await supabase.storage
        .from('excel_files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      return fileName;
    } catch (error) {
      console.error('Storage upload error:', error);
      throw error;
    }
  };

  const deleteFromStorage = async (storagePath) => {
    if (!storagePath) return;

    try {
      const { error } = await supabase.storage
        .from('excel_files')
        .remove([storagePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Storage delete error:', error);
      throw error;
    }
  };

  const handleFileUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      // Check file type
      const fileType = file.name.split('.').pop().toLowerCase();
      if (fileType !== 'xlsx' && fileType !== 'xls') {
        alert('Please upload a valid Excel file (.xlsx or .xls)');
        return;
      }

      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          console.log('File loaded, size:', arrayBuffer.byteLength);
          
          // Parse workbook
          const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
            type: 'array',
            cellStyles: true,
            cellDates: true,
            cellNF: true
          });
          
          console.log('Workbook parsed, sheets:', workbook.SheetNames);
          
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          if (!worksheet['!ref']) {
            throw new Error('Worksheet is empty');
          }

          // Process worksheet data...
          const range = XLSX.utils.decode_range(worksheet['!ref']);
          const cellData = {};
          const styleData = {};
          
          // Iterate through all cells in the range
          for (let row = range.s.r; row <= range.e.r; row++) {
            for (let col = range.s.c; col <= range.e.c; col++) {
              // Convert column number to letter (0 = A, 1 = B, etc.)
              const colLetter = XLSX.utils.encode_col(col);
              const cellRef = `${colLetter}${row + 1}`;
              const cell = worksheet[cellRef];
              
              if (cell) {
                // Get the formatted value if available, otherwise use the raw value
                const value = cell.w || cell.v;
                if (value !== undefined) {
                  cellData[cellRef] = value.toString();
                }

                // Extract cell styles
                const style = {};
                if (cell.s) {
                  if (cell.s.font) {
                    style.fontFamily = cell.s.font.name;
                    style.fontSize = cell.s.font.sz;
                    style.bold = cell.s.font.bold;
                    style.italic = cell.s.font.italic;
                    style.underline = cell.s.font.underline;
                  }
                  if (cell.s.alignment) {
                    style.textAlign = cell.s.alignment.horizontal;
                  }
                }
                if (Object.keys(style).length > 0) {
                  styleData[cellRef] = style;
                }
              }
            }
          }

          // Upload to storage
          const storagePath = await uploadToStorage(file, cellData);

          // Save to database
          const newFile = {
            name: file.name,
            content: cellData,
            styles: styleData,
            storage_path: storagePath,
            created_at: new Date().toISOString(),
            user_email: user.email
          };

          const { data: savedFile, error } = await supabase
            .from('excel_files')
            .insert([newFile])
            .select()
            .single();

          if (error) throw error;

          setFiles(prev => [savedFile, ...prev]);
          setActiveFile(savedFile);
          setCellValues(cellData);
          setCellStyles(styleData);
          
        } catch (error) {
          console.error('Error details:', error);
          alert(`Error processing Excel file: ${error.message}`);
        }
      };

      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        alert('Error reading file. Please try again.');
      };

      reader.readAsArrayBuffer(file);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Error uploading file: ${error.message}`);
    }
  };

  const openFile = (file) => {
    setActiveFile(file);
    setCellValues(file.content || {});
    setCellStyles(file.styles || {});
  };

  const deleteFile = async (fileId) => {
    try {
      const fileToDelete = files.find(f => f.id === fileId);
      if (!fileToDelete) return;

      // Delete from storage if exists
      if (fileToDelete.storage_path) {
        await deleteFromStorage(fileToDelete.storage_path);
      }

      // Delete from database
      const { error } = await supabase
        .from('excel_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      setFiles(prev => prev.filter(f => f.id !== fileId));
      if (activeFile?.id === fileId) {
        setActiveFile(null);
        setCellValues({});
        setCellStyles({});
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert(`Error deleting file: ${error.message}`);
    }
  };

  const handleCellClick = (row, col) => {
    const cellId = `${col}${row}`;
    setActiveCell(cellId);
    
    // Update current sheet's active cell
    setSheets(prevSheets => {
      return prevSheets.map(sheet => {
        if (sheet.id !== activeSheet) return sheet;
        return {
          ...sheet,
          activeCell: cellId
        };
      });
    });

    // Update formula bar
    const currentSheet = getCurrentSheet();
    if (currentSheet) {
      setFormulaBarValue(currentSheet.cellValues[cellId] || '');
    }
  };

  // Helper to get current sheet data
  const getCurrentSheet = () => sheets.find(s => s.id === activeSheet);

  // Update cell values for current sheet
  const handleCellChange = (row, col, value) => {
    const cellId = `${col}${row}`;
    
    setSheets(prevSheets => {
      return prevSheets.map(sheet => {
        if (sheet.id !== activeSheet) return sheet;

        const newCellValues = { ...sheet.cellValues };
        
        // Handle formulas
        if (value.startsWith('=')) {
          try {
            const result = evaluateFormula(value, cellId, sheet.cellValues);
            newCellValues[cellId] = value;
            newCellValues[`${cellId}_display`] = result;
          } catch (error) {
            newCellValues[cellId] = value;
            newCellValues[`${cellId}_display`] = '#ERROR!';
          }
        } else {
          newCellValues[cellId] = value;
          delete newCellValues[`${cellId}_display`];
        }

        // Update dependent cells
        Object.entries(sheet.cellValues).forEach(([key, val]) => {
          if (val && val.startsWith('=') && val.includes(cellId)) {
            try {
              newCellValues[`${key}_display`] = evaluateFormula(val, key, newCellValues);
            } catch (error) {
              newCellValues[`${key}_display`] = '#ERROR!';
            }
          }
        });

        return {
          ...sheet,
          cellValues: newCellValues
        };
      });
    });
    
    setFormulaBarValue(value);
  };

  // Update evaluateFormula to use sheet-specific cell values
  const evaluateFormula = (formula, cellId, sheetCellValues) => {
    try {
      const expression = formula.substring(1).trim();
      const withValues = expression.replace(/[A-Z]+[0-9]+/g, (match) => {
        if (match === cellId) return '0';
        return sheetCellValues[match] || '0';
      });
      const result = new Function('return ' + withValues)();
      return isNaN(result) ? '#ERROR!' : result.toString();
    } catch (error) {
      return '#ERROR!';
    }
  };

  // Update cell styles for current sheet
  const updateCellStyle = (cellId, style) => {
    setSheets(prevSheets => {
      return prevSheets.map(sheet => {
        if (sheet.id !== activeSheet) return sheet;
        return {
          ...sheet,
          cellStyles: {
            ...sheet.cellStyles,
            [cellId]: { ...(sheet.cellStyles[cellId] || {}), ...style }
          }
        };
      });
    });
  };

  // Update sheet management functions
  const addNewSheet = () => {
    const newSheetId = Math.max(...sheets.map(s => s.id)) + 1;
    const newSheet = {
      id: newSheetId,
      name: `Sheet${newSheetId}`,
      cellValues: {},
      cellStyles: {},
      selectedCells: { start: null, end: null },
      activeCell: null
    };
    setSheets(prev => [...prev, newSheet]);
    setActiveSheet(newSheetId);
  };

  const handleSheetClick = (sheetId) => {
    setActiveSheet(sheetId);
    const sheet = sheets.find(s => s.id === sheetId);
    if (sheet) {
      setSelectedCells(sheet.selectedCells);
      setActiveCell(sheet.activeCell);
    }
  };

  // Update cell selection handlers
  const handleMouseEnter = (row, col) => {
    if (isDragging) {
      const cellId = `${col}${row}`;
      setDragEnd(cellId);
      
      const newSelection = { start: dragStart, end: cellId };
      setSelectedCells(newSelection);
      
      // Update current sheet's selection
      setSheets(prevSheets => {
        return prevSheets.map(sheet => {
          if (sheet.id !== activeSheet) return sheet;
          return {
            ...sheet,
            selectedCells: newSelection
          };
        });
      });
    }
  };

  // Helper function to check if a cell is within selection range
  const isCellInRange = (cellId, selection) => {
    if (!selection.start || !selection.end) return false;
    
    const [startCol, startRow] = [
      selection.start.match(/[A-Z]+/)[0],
      parseInt(selection.start.match(/\d+/)[0])
    ];
    const [endCol, endRow] = [
      selection.end.match(/[A-Z]+/)[0],
      parseInt(selection.end.match(/\d+/)[0])
    ];
    const [currentCol, currentRow] = [
      cellId.match(/[A-Z]+/)[0],
      parseInt(cellId.match(/\d+/)[0])
    ];

    const minCol = String.fromCharCode(Math.min(startCol.charCodeAt(0), endCol.charCodeAt(0)));
    const maxCol = String.fromCharCode(Math.max(startCol.charCodeAt(0), endCol.charCodeAt(0)));
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);

    return currentCol >= minCol && currentCol <= maxCol && 
           currentRow >= minRow && currentRow <= maxRow;
  };

  // Update cell rendering
  const renderCell = (row, col) => {
    const currentSheet = getCurrentSheet();
    if (!currentSheet) return null;

    const cellId = `${col}${row}`;
    const isActive = currentSheet.activeCell === cellId;
    const cellStyle = currentSheet.cellStyles[cellId] || {};
    const isSelected = currentSheet.selectedCells.start && 
                      currentSheet.selectedCells.end && 
                      isCellInRange(cellId, currentSheet.selectedCells);
    
    const displayValue = isActive 
      ? (currentSheet.cellValues[cellId] || '') 
      : getCellDisplayValue(cellId, currentSheet.cellValues);
    
    return (
      <td
        key={cellId}
        className={`
          relative border border-gray-200 p-0 select-none cursor-default
          ${isActive ? 'z-10' : ''}
          ${isSelected ? 'bg-blue-50' : 'bg-white'}
        `}
        style={{
          height: `${BASE_CELL_HEIGHT}px`,
          outline: isActive ? '2px solid #2563eb' : 'none',
          outlineOffset: '-1px'
        }}
        onClick={() => handleCellClick(row, col)}
        onMouseDown={(e) => handleMouseDown(row, col, e)}
        onMouseEnter={() => handleMouseEnter(row, col)}
        onMouseUp={handleGlobalMouseUp}
      >
        {isActive ? (
          <input
            type="text"
            value={displayValue}
            onChange={(e) => handleCellChange(row, col, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, row, col)}
            className="w-full h-full px-2 py-1 border-none focus:outline-none bg-transparent absolute inset-0"
            style={{
              fontFamily: cellStyle.fontFamily || fontFamily,
              fontSize: `${cellStyle.fontSize || fontSize}px`,
              fontWeight: cellStyle.bold || isBold ? 'bold' : 'normal',
              fontStyle: cellStyle.italic || isItalic ? 'italic' : 'normal',
              textDecoration: cellStyle.underline || isUnderline ? 'underline' : 'none',
              textAlign: cellStyle.textAlign || textAlign,
            }}
            autoFocus
          />
        ) : (
          <div
            className="w-full h-full px-2 py-1 overflow-hidden whitespace-nowrap"
            style={{
              fontFamily: cellStyle.fontFamily || fontFamily,
              fontSize: `${cellStyle.fontSize || fontSize}px`,
              fontWeight: cellStyle.bold || isBold ? 'bold' : 'normal',
              fontStyle: cellStyle.italic || isItalic ? 'italic' : 'normal',
              textDecoration: cellStyle.underline || isUnderline ? 'underline' : 'none',
              textAlign: cellStyle.textAlign || textAlign,
            }}
          >
            {displayValue}
          </div>
        )}
      </td>
    );
  };

  const handleFormulaBarChange = (e) => {
    const value = e.target.value;
    setFormulaBarValue(value);
    
    if (activeCell) {
      const [col, row] = [
        activeCell.match(/[A-Z]+/)[0],
        parseInt(activeCell.match(/\d+/)[0])
      ];
      handleCellChange(row, col, value);
    }
  };

  const handleKeyDown = (e, row, col) => {
    const currentIndex = columns.indexOf(col);
    const currentRow = row;

    switch (e.key) {
      case 'ArrowRight':
        if (currentIndex < columns.length - 1) {
          handleCellClick(currentRow, columns[currentIndex + 1]);
        }
        break;
      case 'ArrowLeft':
        if (currentIndex > 0) {
          handleCellClick(currentRow, columns[currentIndex - 1]);
        }
        break;
      case 'ArrowDown':
        if (currentRow < rows.length) {
          handleCellClick(currentRow + 1, col);
        }
        break;
      case 'ArrowUp':
        if (currentRow > 1) {
          handleCellClick(currentRow - 1, col);
        }
        break;
      case 'Enter':
        if (currentRow < rows.length) {
          handleCellClick(currentRow + 1, col);
        }
        break;
      case 'Tab':
        e.preventDefault();
        if (currentIndex < columns.length - 1) {
          handleCellClick(currentRow, columns[currentIndex + 1]);
        }
        break;
    }
  };

  const downloadAsExcel = () => {
    // Convert cell values to worksheet format
    const worksheet = XLSX.utils.aoa_to_sheet([[]]);
    Object.entries(cellValues).forEach(([cellId, value]) => {
      const col = cellId.match(/[A-Z]+/)[0];
      const row = parseInt(cellId.match(/\d+/)[0]);
      XLSX.utils.sheet_add_aoa(worksheet, [[value]], { origin: cellId });
    });

    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Download file
    XLSX.writeFile(workbook, 'worksheet.xlsx');
  };

  const saveCurrentFile = async () => {
    if (!activeFile) return;

    try {
      const { error } = await supabase
        .from('excel_files')
        .update({
          content: cellValues,
          styles: cellStyles,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeFile.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Error saving file. Please try again.');
    }
  };

  // Update getCellDisplayValue to use sheet-specific values
  const getCellDisplayValue = (cellId, sheetCellValues) => {
    const value = sheetCellValues[cellId];
    if (!value) return '';
    
    if (value.startsWith('=')) {
      return sheetCellValues[`${cellId}_display`] || '#ERROR!';
    }
    return value;
  };

  // Add reset zoom function near other zoom functions
  const resetZoom = () => {
    setZoomLevel(100);
    setZoomInput("100");
  };

  return (
    <div className="flex h-full">
      {/* Remove the file sidebar section and adjust main container */}
      <div className="w-full flex flex-col" style={{ maxWidth: '1400px', marginLeft: '5px' }}>
        {/* Menu Bar */}
        <div className="excel-menu border-b border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-gray-200 bg-white shadow-sm">
              <button
                onClick={createNewWorksheet}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 border-r border-gray-200 rounded-l-lg"
                title="Create new worksheet"
              >
                <MdAdd size={18} className="text-blue-600" />
                <span className="font-medium">New</span>
              </button>
              <button
                onClick={() => saveCurrentFile()}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 border-r border-gray-200"
                title="Save current worksheet"
              >
                <MdSave size={18} className="text-blue-600" />
                <span className="font-medium">Save</span>
              </button>
              <button
                onClick={() => downloadAsExcel()}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 border-r border-gray-200"
                title="Download as Excel file"
              >
                <MdDownload size={18} className="text-blue-600" />
                <span className="font-medium">Download</span>
              </button>
              <label 
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer rounded-r-lg"
                title="Upload Excel file"
              >
                <MdUpload size={18} className="text-blue-600" />
                <span className="font-medium">Upload</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            <div className="flex rounded-lg border border-gray-200 bg-white shadow-sm">
              <button
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 border-r border-gray-200 rounded-l-lg"
                title="Cut"
              >
                <MdContentCut size={18} className="text-gray-600" />
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 border-r border-gray-200"
                title="Copy"
              >
                <MdContentCopy size={18} className="text-gray-600" />
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-r-lg"
                title="Paste"
              >
                <MdContentPaste size={18} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="excel-ribbon">
          <div className="flex gap-4">
            <div className="flex items-center gap-2 border-r pr-4">
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="excel-dropdown"
              >
                <option value="Calibri">Calibri</option>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
              </select>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="excel-dropdown"
              >
                {[8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 border-r pr-4">
              <button
                onClick={() => setIsBold(!isBold)}
                className={`toolbar-button ${isBold ? 'active' : ''}`}
                title="Bold"
              >
                <MdFormatBold size={20} />
              </button>
              <button
                onClick={() => setIsItalic(!isItalic)}
                className={`toolbar-button ${isItalic ? 'active' : ''}`}
                title="Italic"
              >
                <MdFormatItalic size={20} />
              </button>
              <button
                onClick={() => setIsUnderline(!isUnderline)}
                className={`toolbar-button ${isUnderline ? 'active' : ''}`}
                title="Underline"
              >
                <MdFormatUnderlined size={20} />
              </button>
            </div>

            <div className="flex items-center gap-2 border-r pr-4">
              <button
                className={`toolbar-button ${textAlign === 'left' ? 'active' : ''}`}
                onClick={() => setTextAlign('left')}
                title="Align Left"
              >
                <MdFormatAlignLeft size={20} />
              </button>
              <button
                className={`toolbar-button ${textAlign === 'center' ? 'active' : ''}`}
                onClick={() => setTextAlign('center')}
                title="Center"
              >
                <MdFormatAlignCenter size={20} />
              </button>
              <button
                className={`toolbar-button ${textAlign === 'right' ? 'active' : ''}`}
                onClick={() => setTextAlign('right')}
                title="Align Right"
              >
                <MdFormatAlignRight size={20} />
              </button>
            </div>

            <div className="flex items-center gap-2 border-r pr-4">
              <button className="toolbar-button" title="Insert Function">
                <MdFunctions size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Formula Bar */}
        <div className="formula-bar">
          <MdFunctions size={20} />
          <input
            type="text"
            value={formulaBarValue}
            onChange={handleFormulaBarChange}
            placeholder="Enter formula or value"
          />
        </div>

        {/* Spreadsheet container */}
        <div className="flex-1 overflow-hidden flex flex-col" style={{ height: '600px' }}>
          <div className="relative" style={{ height: '67%' }}>
            <div 
              ref={gridContainerRef}
              className="excel-grid absolute inset-0 overflow-auto"
              style={{
                width: '100%',
                height: '100%',
               
              }}
            >
              <div 
                className="relative"
                style={{
                  width: `${(customColumns.length * BASE_CELL_WIDTH + 40)}px`,
                  height: `${(customRows * BASE_CELL_HEIGHT + BASE_CELL_HEIGHT)}px`,
                  transform: `scale(${zoomLevel / 120})`,
                  transformOrigin: '0 0'
                }}
              >
                <table 
                  className="border-collapse" 
                  style={{ 
                    tableLayout: 'fixed',
                    width: 'fit-content',
                    borderSpacing: 0
                  }}
                >
                  <colgroup>
                    <col style={{ width: '40px' }} />
                    {customColumns.map(col => (
                      <col key={col} style={{ width: `${BASE_CELL_WIDTH}px` }} />
                    ))}
                  </colgroup>
                  <thead className="sticky top-0 z-20 bg-gray-50">
                    <tr>
                      <th className="border border-gray-200" style={{ height: `${BASE_CELL_HEIGHT}px` }}></th>
                      {customColumns.map(col => (
                        <th
                          key={col}
                          className="border border-gray-200 px-2 py-1 font-semibold text-gray-700 relative"
                          style={{ height: `${BASE_CELL_HEIGHT}px` }}
                          onContextMenu={(e) => handleHeaderContextMenu(e, 'column', col)}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: customRows }, (_, i) => i + 1).map(row => (
                      <tr key={row}>
                        <th
                          className="sticky left-0 z-10 bg-gray-50 border border-gray-200 px-2 py-1 font-semibold text-gray-700"
                          style={{ height: `${BASE_CELL_HEIGHT}px` }}
                          onContextMenu={(e) => handleHeaderContextMenu(e, 'row', row)}
                        >
                          {row}
                        </th>
                        {customColumns.map(col => renderCell(row, col))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Bottom control bar with sheets and zoom */}
          <div className="h-9 border-t border-gray-200 bg-white flex items-center justify-between px-2">
            {/* Sheet tabs */}
            <div className="flex items-center space-x-1">
              {sheets.map(sheet => (
                <button
                  key={sheet.id}
                  onClick={() => handleSheetClick(sheet.id)}
                  className={`px-4 py-1 text-sm rounded-t-md transition-colors
                    ${activeSheet === sheet.id 
                      ? 'bg-white border-t-2 border-blue-500 font-medium' 
                      : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {sheet.name}
                </button>
              ))}
              <button
                onClick={addNewSheet}
                className="p-1 hover:bg-gray-200 rounded-md"
                title="Add Sheet"
              >
                <MdAdd size={18} />
              </button>
            </div>

            {/* Modern minimal zoom controls with adjustable sizes */}
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center bg-white shadow-sm border border-gray-100"
                style={zoomControlStyles.container}
              >
                <span 
                  className="font-medium text-gray-900"
                  style={zoomControlStyles.percentage}
                >
                  {zoomInput}%
                </span>
                
                <button
                  onClick={() => {
                    const newZoom = Math.max(50, zoomLevel - 10);
                    setZoomLevel(newZoom);
                    setZoomInput(newZoom.toString());
                  }}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  style={zoomControlStyles.buttons}
                  title="Zoom Out"
                >
                  <span className="font-medium">−</span>
                </button>

                <button
                  onClick={() => {
                    const newZoom = Math.min(200, zoomLevel + 10);
                    setZoomLevel(newZoom);
                    setZoomInput(newZoom.toString());
                  }}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  style={zoomControlStyles.buttons}
                  title="Zoom In"
                >
                  <span className="font-medium">+</span>
                </button>

                <button
                  onClick={resetZoom}
                  className="text-[#B4641B] hover:bg-orange-50 rounded-full transition-colors font-medium"
                  style={zoomControlStyles.reset}
                  title="Reset Zoom"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Context Menu */}
        {contextMenu.visible && (
          <div
            className="fixed bg-white shadow-xl rounded-lg py-1 z-50 min-w-[200px] border border-gray-200"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            {getContextMenuItems(contextMenu.type, contextMenu.index).map((item, index) => (
              <React.Fragment key={index}>
                <button
                  className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-3 transition-colors duration-150"
                  onClick={() => {
                    item.action();
                    setContextMenu({ ...contextMenu, visible: false });
                  }}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-gray-400 text-xs">{item.shortcut}</span>
                  )}
                </button>
                {[2, 4].includes(index) && (
                  <div className="my-1 border-t border-gray-100" />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelWorkshop;