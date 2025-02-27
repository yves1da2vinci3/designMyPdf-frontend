import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Text,
  Group,
  Paper,
  useMantineTheme,
  ActionIcon,
  Stack,
  Button,
  TextInput,
  ColorInput,
  NumberInput,
  Select,
  ScrollArea,
} from '@mantine/core';
import { useDrag, useDrop } from 'react-dnd';
import {
  IconGripVertical,
  IconTrash,
  IconEdit,
  IconPhoto,
  IconChartBar,
  IconTable,
  IconTextSize,
} from '@tabler/icons-react';

// Types pour les éléments drag-and-drop
interface DndItem {
  id: string;
  type: 'text' | 'image' | 'chart' | 'table';
  content: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: Record<string, any>;
}

// Types pour les propriétés du composant
interface DragDropEditorProps {
  onChange: (htmlContent: string) => void;
  initialContent?: string;
}

// Composants draggables
const DraggableItem: React.FC<{
  item: DndItem;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  updateItem: (id: string, updates: Partial<DndItem>) => void;
  removeItem: (id: string) => void;
  openEditor: (id: string) => void;
}> = ({ item, index, moveItem, updateItem, removeItem, openEditor }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'EDITOR_ITEM',
    item: () => ({ id: item.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'EDITOR_ITEM',
    hover: (draggedItem: { id: string; index: number }, monitor) => {
      if (!ref.current) return;
      const dragIndex = draggedItem.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveItem(dragIndex, hoverIndex);
      draggedItem.index = hoverIndex;
    },
  });

  drag(drop(ref));

  const renderContent = () => {
    switch (item.type) {
      case 'text':
        return <Text style={item.style}>{item.content}</Text>;
      case 'image':
        return (
          <img
            src={item.content}
            alt="Draggable element"
            style={{ maxWidth: '100%', ...item.style }}
          />
        );
      case 'chart':
        return (
          <Box style={{ backgroundColor: '#f0f0f0', padding: '10px', ...item.style }}>
            Chart Placeholder
          </Box>
        );
      case 'table':
        return (
          <Box style={{ backgroundColor: '#f0f0f0', padding: '10px', ...item.style }}>
            Table Placeholder
          </Box>
        );
      default:
        return <Text>Unknown element</Text>;
    }
  };

  return (
    <Paper
      ref={ref}
      shadow="xs"
      p="md"
      withBorder
      style={{
        marginBottom: 10,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        position: 'relative',
      }}
    >
      <Group justify="space-between" align="center">
        <Group>
          <ActionIcon>
            <IconGripVertical size={16} />
          </ActionIcon>
          <Box>{renderContent()}</Box>
        </Group>
        <Group gap={5}>
          <ActionIcon color="blue" onClick={() => openEditor(item.id)}>
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon color="red" onClick={() => removeItem(item.id)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Group>
    </Paper>
  );
};

// Éditeur de propriétés pour les éléments
const ItemEditor: React.FC<{
  item: DndItem | null;
  updateItem: (id: string, updates: Partial<DndItem>) => void;
  onClose: () => void;
}> = ({ item, updateItem, onClose }) => {
  if (!item) return null;

  const handleUpdate = (key: string, value: any) => {
    updateItem(item.id, { [key]: value });
  };

  const handleStyleUpdate = (styleKey: string, value: any) => {
    updateItem(item.id, { style: { ...item.style, [styleKey]: value } });
  };

  return (
    <Box p="md">
      <Stack gap="md">
        <Text fw={600}>Edit {item.type} element</Text>

        {item.type === 'text' && (
          <>
            <TextInput
              label="Content"
              value={item.content}
              onChange={(e) => handleUpdate('content', e.target.value)}
            />
            <ColorInput
              label="Text Color"
              value={item.style.color || '#000000'}
              onChange={(value) => handleStyleUpdate('color', value)}
            />
            <NumberInput
              label="Font Size"
              value={parseInt(item.style.fontSize || '16', 10)}
              onChange={(value) => handleStyleUpdate('fontSize', `${value}px`)}
              min={8}
              max={72}
            />
            <Select
              label="Font Weight"
              value={item.style.fontWeight || 'normal'}
              onChange={(value) => handleStyleUpdate('fontWeight', value)}
              data={[
                { value: 'normal', label: 'Normal' },
                { value: 'bold', label: 'Bold' },
                { value: '300', label: 'Light' },
                { value: '600', label: 'Semi Bold' },
              ]}
            />
          </>
        )}

        {item.type === 'image' && (
          <>
            <TextInput
              label="Image URL"
              value={item.content}
              onChange={(e) => handleUpdate('content', e.target.value)}
            />
            <NumberInput
              label="Width"
              value={parseInt(item.style.width || '200', 10)}
              onChange={(value) => handleStyleUpdate('width', `${value}px`)}
              min={50}
              max={800}
            />
          </>
        )}

        <Group justify="flex-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Box>
  );
};

// Composant principal de l'éditeur drag-and-drop
const DragDropEditor: React.FC<DragDropEditorProps> = ({ onChange, initialContent }) => {
  const [items, setItems] = useState<DndItem[]>([]);
  const [editingItem, setEditingItem] = useState<DndItem | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const theme = useMantineTheme();

  // Initialiser avec le contenu existant si disponible
  useEffect(() => {
    if (initialContent) {
      try {
        // Ici, on pourrait parser le HTML pour extraire les éléments
        // Pour l'instant, on commence avec un élément texte par défaut
        setItems([
          {
            id: 'default-text',
            type: 'text',
            content: 'Edit this text',
            position: { x: 10, y: 10 },
            size: { width: 200, height: 50 },
            style: { fontSize: '16px', color: '#000000' },
          },
        ]);
      } catch (error) {
        console.error('Error parsing initial content:', error);
      }
    }
  }, [initialContent]);

  // Générer le HTML à partir des éléments
  useEffect(() => {
    const generateHtml = () => {
      let html = '<div class="pdf-container">';

      items.forEach((item) => {
        switch (item.type) {
          case 'text': {
            const textStyle = Object.entries(item.style)
              .map(([key, value]) => `${key}: ${value}`)
              .join('; ');
            html += `<div style="position: relative; ${textStyle}">${item.content}</div>`;
            break;
          }
          case 'image': {
            const imgStyle = Object.entries(item.style)
              .map(([key, value]) => `${key}: ${value}`)
              .join('; ');
            html += `<img src="${item.content}" alt="Image" style="${imgStyle}" />`;
            break;
          }
          case 'chart':
            html +=
              '<div class="chart-placeholder" style="background-color: #f0f0f0; padding: 10px;">Chart Placeholder</div>';
            break;
          case 'table':
            html +=
              '<div class="table-placeholder" style="background-color: #f0f0f0; padding: 10px;">Table Placeholder</div>';
            break;
        }
      });

      html += '</div>';
      return html;
    };

    const html = generateHtml();
    onChange(html);
  }, [items, onChange]);

  // Gérer le déplacement des éléments
  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const draggedItem = items[dragIndex];
    const newItems = [...items];
    newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, draggedItem);
    setItems(newItems);
  };

  // Mettre à jour un élément
  const updateItem = (id: string, updates: Partial<DndItem>) => {
    setItems((prevItems) =>
      prevItems.map((itemToUpdate) =>
        itemToUpdate.id === id ? { ...itemToUpdate, ...updates } : itemToUpdate
      )
    );
  };

  // Supprimer un élément
  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Ouvrir l'éditeur d'élément
  const openEditor = (id: string) => {
    const item = items.find((item) => item.id === id);
    if (item) {
      setEditingItem(item);
    }
  };

  // Ajouter un nouvel élément
  const addItem = (type: 'text' | 'image' | 'chart' | 'table') => {
    const newItem: DndItem = {
      id: `${type}-${Date.now()}`,
      type,
      content:
        type === 'text' ? 'New Text' : type === 'image' ? 'https://via.placeholder.com/150' : {},
      position: { x: 0, y: 0 },
      size: { width: 200, height: type === 'text' ? 50 : 150 },
      style: type === 'text' ? { fontSize: '16px', color: '#000000' } : {},
    };
    setItems((prevItems) => [...prevItems, newItem]);
  };

  return (
    <Box style={{ display: 'flex', height: '100%' }}>
      {/* Palette d'outils */}
      <Box
        style={{
          width: '200px',
          borderRight: `1px solid ${theme.colors.gray[3]}`,
          padding: '10px',
        }}
      >
        <Text fw={600} mb="md">
          Elements
        </Text>
        <Stack gap="sm">
          <Button
            leftSection={<IconTextSize size={16} />}
            variant="outline"
            fullWidth
            onClick={() => addItem('text')}
          >
            Text
          </Button>
          <Button
            leftSection={<IconPhoto size={16} />}
            variant="outline"
            fullWidth
            onClick={() => addItem('image')}
          >
            Image
          </Button>
          <Button
            leftSection={<IconChartBar size={16} />}
            variant="outline"
            fullWidth
            onClick={() => addItem('chart')}
          >
            Chart
          </Button>
          <Button
            leftSection={<IconTable size={16} />}
            variant="outline"
            fullWidth
            onClick={() => addItem('table')}
          >
            Table
          </Button>
        </Stack>
      </Box>

      {/* Zone d'édition */}
      <Box style={{ flex: 1, display: 'flex' }}>
        <ScrollArea style={{ flex: 1, height: '100%' }}>
          <Box
            ref={canvasRef}
            style={{
              padding: '20px',
              minHeight: '100%',
              backgroundColor: '#ffffff',
              position: 'relative',
            }}
          >
            {items.map((item, index) => (
              <DraggableItem
                key={item.id}
                item={item}
                index={index}
                moveItem={moveItem}
                updateItem={updateItem}
                removeItem={removeItem}
                openEditor={openEditor}
              />
            ))}
          </Box>
        </ScrollArea>

        {/* Éditeur de propriétés */}
        {editingItem && (
          <Box style={{ width: '300px', borderLeft: `1px solid ${theme.colors.gray[3]}` }}>
            <ItemEditor
              item={editingItem}
              updateItem={updateItem}
              onClose={() => setEditingItem(null)}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DragDropEditor;
