import React, { useEffect, useState, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import {
  Box,
  Button,
  Checkbox,
  Group,
  Select,
  Stack,
  Text,
  rem,
  Loader,
  Center,
  Drawer,
  Textarea,
  ActionIcon,
  Tooltip,
  ScrollArea,
  SimpleGrid,
  Image,
  Menu,
  Divider,
  Card,
  Badge,
  TextInput,
  Tabs,
  Modal,
  ColorSwatch,
  ColorInput,
  SegmentedControl,
} from '@mantine/core';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useDisclosure } from '@mantine/hooks';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import {
  IconChevronLeft,
  IconDownload,
  IconMinus,
  IconPlus,
  IconWand,
  IconChartDots,
  IconShoppingCart,
  IconX,
  IconTrash,
  IconChevronRight,
  IconFileExport,
  IconDotsVertical,
  IconHelp,
  IconFileText,
  IconFileInvoice,
  IconUser,
  IconReport,
  IconBriefcase,
  IconGavel,
  IconPresentation,
  IconReceipt,
  IconCertificate,
  IconSearch,
  IconLock,
  IconArrowsMaximize,
  IconArrowsMinimize,
} from '@tabler/icons-react';

import { Editor } from '@monaco-editor/react';
import { ensureMonacoReady } from '@/lib/monacoBootstrap';
import Preview from './Preview';
import AddVariable from '@/modals/AddVariable/AddVariable';
import VariableBadge from '@/components/VariableBadge/VariableBadge';
import ExportPdfProgress, {
  type ExportPdfProgressStep,
} from '@/components/ExportPdfProgress/ExportPdfProgress';
import { DEFAULT_TEMPLATE } from '@/constants/template';
import { DEFAULT_FONT, fonts } from '@/constants/fonts';
import { RequestStatus } from '@/api/request-status.enum';
import { TemplateDTO, templateApi, MarketplaceTemplateCard } from '@/api/templateApi';
import { isPdfContentPaddingValid } from '@/utils/pdfContentPadding';
import { prepareRenderedHtml } from '@/utils/prepareRenderedHtml';
import notificationService from '@/services/NotificationService';
import { authJsonHeaders } from '@/lib/authFetch';
import AiChatPanel from '@/components/AiChat/AiChatPanel';
import type { ChatMessage } from '@/lib/aiGeneration/types';
import { normalizeEditorHtmlFragment } from '@/lib/aiGeneration/cleanHtml';
import { useAiCredits } from '@/hooks/useAiCredits';
import { FormatType } from '../../../../utils/types';
import {
  CHART_TYPES,
  generateChartData,
  processChartData,
  replaceChartDataPlaceholders,
  extractChartBindingsFromTemplate,
  parseChartJsonFile,
  parseChartCsvWithPapa,
  parseChartExcelFile,
  isChartDataValidForType,
} from '../../../../utils/chartUtils';
import { DEFAULT_FORMAT } from '../../../../utils/paperUtils';
import { manuallyStartTour } from '../../../../utils/tourUtils';
import { useLocalStorage } from '../../../../utils/useLocalStorage';
import { REFERENCE_TEMPLATES } from '@/services/agent/templateLibrary';
import {
  extractVariablesFromTemplate,
  buildVariableStructure,
} from '@/services/agent/templateUtils';
import type { ReferenceTemplate } from '@/services/agent/types';
import 'driver.js/dist/driver.css';

const IDE = dynamic(() => import('@/components/TemplateHtmlEditor/TemplateHtmlEditor'), {
  ssr: false,
  loading: () => null,
});

function splitChartsFromVariables(raw: Record<string, any> | null | undefined): {
  rest: Record<string, any>;
  charts: Record<string, unknown>;
} {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { rest: {}, charts: {} };
  }
  const { charts, ...rest } = raw as Record<string, any> & { charts?: Record<string, unknown> };
  const chartMap =
    charts && typeof charts === 'object' && !Array.isArray(charts) ? { ...charts } : {};
  return { rest: { ...rest }, charts: chartMap };
}

const data = {
  fromCompany: {
    name: 'Example Corp',
    street: '123 Main St',
    city: 'Example City',
    country: 'Example Country',
    zip: '12345',
  },
  toCompany: {
    name: 'Client Corp',
    street: '456 Client St',
    city: 'Client City',
    country: 'Client Country',
    zip: '67890',
  },
  invoiceNumber: 'INV-12345',
  issueDate: '2024-06-10',
  dueDate: '2024-06-24',
  items: [
    { name: 'Service A', quantity: 10, taxes: 5, price: 100 },
    { name: 'Service B', quantity: 5, taxes: 2, price: 50 },
  ],
  prices: {
    subtotal: 150,
    discount: 10,
    taxes: 7,
    total: 147,
  },
  showTerms: true,
};

function resolveTemplateIdFromQuery(queryId: string | string[] | undefined): string {
  if (typeof queryId === 'string') return queryId;
  if (Array.isArray(queryId)) return queryId[0] ?? '';
  return '';
}

const CreateTemplate: React.FC = () => {
  const router = useRouter();
  const templateId = router.isReady ? resolveTemplateIdFromQuery(router.query.id) : '';
  const editorRef = useRef<any>(null);
  const [monacoReady, setMonacoReady] = useState(false);
  /** Force Monaco remount after loading external HTML so model + editorRef stay in sync. */
  const [editorSessionKey, setEditorSessionKey] = useState(0);

  const [isLoading, setIsLoading] = useState(RequestStatus.NotStated);
  const [template, setTemplate] = useState<TemplateDTO | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [code, setCode] = useState<string>(DEFAULT_TEMPLATE);
  const [jsonContent, setJsonContent] = useState<string>(JSON.stringify(data, null, 2));
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [suggestedVariables, setSuggestedVariables] = useState<any>(null);
  const [addVariableOpened, { open: openAddVariable, close: closeAddVariable }] =
    useDisclosure(false);
  const [format, setFormat] = useState<FormatType>(DEFAULT_FORMAT);
  const [isLandScape, setIsLandScape] = useState<boolean>(false);
  const [fontsSelected, setFontsSelected] = useState([DEFAULT_FONT]);
  const [templateContent, setTemplateContent] = useState('');
  const [promptDrawerOpened, { open: openPromptDrawer, close: closePromptDrawer }] =
    useDisclosure(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ url: string; fileName: string; fileId: string }>
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const {
    used: creditsUsed,
    limit: creditsLimit,
    remaining: creditsRemaining,
    refresh: refreshAiCredits,
  } = useAiCredits();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInputDraft, setChatInputDraft] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showTourButton, setShowTourButton] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useLocalStorage('hasSeenTemplateEditorTour', false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [pdfBgColor, setPdfBgColor] = useState<string>('#FFFFFF');
  const [pdfContentPadding, setPdfContentPadding] = useState<string>('');
  const [viewMode, setViewMode] = useState<'single' | 'book'>('single');
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [templateDrawerOpened, { open: openTemplateDrawer, close: closeTemplateDrawer }] =
    useDisclosure(false);
  const [templateTab, setTemplateTab] = useState<string>('default');
  const [templateSearch, setTemplateSearch] = useState('');
  const [marketplaceTemplates, setMarketplaceTemplates] = useState<MarketplaceTemplateCard[]>([]);
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);
  const [marketplaceLoaded, setMarketplaceLoaded] = useState(false);
  const [previewRenderedHtml, setPreviewRenderedHtml] = useState<string | null>(null);

  const [chartDatasets, setChartDatasets] = useState<Record<string, unknown>>({});
  const [chartJsonModalOpened, { open: openChartJsonModal, close: closeChartJsonModal }] =
    useDisclosure(false);
  const [chartsHubOpened, { open: openChartsHub, close: closeChartsHub }] = useDisclosure(false);
  const [chartEditId, setChartEditId] = useState<string | null>(null);
  const [chartEditJson, setChartEditJson] = useState('');
  const chartFileInputRef = useRef<HTMLInputElement>(null);
  const chartImportTargetIdRef = useRef<string | null>(null);

  const [exportPdfProgress, setExportPdfProgress] = useState<{
    opened: boolean;
    activeStep: ExportPdfProgressStep;
    error: string | null;
  } | null>(null);

  const mergedTemplateData = useMemo(
    () => ({ ...variables, charts: chartDatasets }),
    [variables, chartDatasets],
  );

  const fetchTemplate = async (id: string) => {
    if (!id) return;
    try {
      setIsLoading(RequestStatus.InProgress);
      const fetchedTemplate = await templateApi.getTemplateById(id);
      setTemplate(fetchedTemplate);
      setTemplateName(fetchedTemplate.name?.trim() ?? '');
      setCode(fetchedTemplate.content || DEFAULT_TEMPLATE);
      const { rest, charts } = splitChartsFromVariables(
        (fetchedTemplate.variables as Record<string, any>) || data,
      );
      setChartDatasets(charts);
      setVariables(rest);
      setJsonContent(JSON.stringify(rest, null, 2));
      setFontsSelected(fetchedTemplate.fonts || [DEFAULT_FONT]);
      if (fetchedTemplate.pdf_background_color) {
        setPdfBgColor(fetchedTemplate.pdf_background_color);
      }
      setPdfContentPadding(fetchedTemplate.pdf_content_padding ?? '');
      setIsLoading(RequestStatus.Succeeded);
    } catch (error) {
      setIsLoading(RequestStatus.Failed);
    }
  };

  useEffect(() => {
    if (!router.isReady || !templateId) return;
    void fetchTemplate(templateId);
  }, [router.isReady, templateId]);

  useEffect(() => {
    setChatMessages([]);
    setChatInputDraft('');
  }, [templateId]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const html = await prepareRenderedHtml(code, mergedTemplateData, {
          paperSize: format,
          isLandscape: isLandScape,
          pdfContentPadding,
          pdfBackgroundColor: pdfBgColor,
          fonts: fontsSelected,
        });
        if (!cancelled) setPreviewRenderedHtml(html);
      } catch {
        if (!cancelled) setPreviewRenderedHtml(null);
      }
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [code, mergedTemplateData, format, isLandScape, pdfContentPadding, pdfBgColor, fontsSelected]);

  useEffect(() => {
    let cancelled = false;
    void ensureMonacoReady().then(() => {
      if (!cancelled) {
        setMonacoReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      const parsedVariables = JSON.parse(jsonContent) as Record<string, any>;
      const { rest } = splitChartsFromVariables(parsedVariables);
      setVariables(rest);
    } catch (error) {
      // Silently handle JSON parsing errors
    }
  }, [jsonContent]);

  const handleVariablesUpdate = (newVariables: any) => {
    const { rest } = splitChartsFromVariables(newVariables || {});
    setVariables(rest);
    setJsonContent(JSON.stringify(rest, null, 2));
  };

  const handleTemplateSelect = (templateItem: ReferenceTemplate) => {
    // Charger le code HTML du template
    setCode(templateItem.code);
    setEditorSessionKey((k) => k + 1);

    // Extraire les variables Handlebars du code
    const extractedVars = extractVariablesFromTemplate(templateItem.code);

    // Générer les variables par défaut avec des valeurs réalistes
    const defaultVariables = buildVariableStructure(extractedVars, templateItem.code);
    const { rest, charts } = splitChartsFromVariables(defaultVariables);
    setChartDatasets(charts);
    handleVariablesUpdate(rest);
    setSelectedTemplateId(templateItem.id);
    closeTemplateDrawer();

    notificationService.showSuccessNotification(
      `Template "${templateItem.name}" loaded successfully`,
    );
  };

  const loadMarketplaceTemplates = async () => {
    if (marketplaceLoaded) return;
    setMarketplaceLoading(true);
    try {
      const results = await templateApi.getMarketplaceTemplates();
      setMarketplaceTemplates(results);
      setMarketplaceLoaded(true);
    } catch {
      // Silently handle
    } finally {
      setMarketplaceLoading(false);
    }
  };

  const handleMarketplaceSelect = async (tpl: MarketplaceTemplateCard) => {
    try {
      const full = await templateApi.getMarketplaceTemplate(String(tpl.ID));
      setCode(full.content || DEFAULT_TEMPLATE);
      setEditorSessionKey((k) => k + 1);
      const extractedVars = extractVariablesFromTemplate(full.content || '');
      const defaultVariables = buildVariableStructure(extractedVars, full.content || '');
      const { rest, charts } = splitChartsFromVariables(defaultVariables);
      setChartDatasets(charts);
      handleVariablesUpdate(rest);
      setSelectedTemplateId(String(tpl.ID));
      closeTemplateDrawer();
      notificationService.showSuccessNotification(`Template "${tpl.name}" loaded successfully`);
    } catch {
      notificationService.showErrorNotification('Failed to load marketplace template');
    }
  };

  const mergeSuggestedVariables = () => {
    if (suggestedVariables) {
      const mergedPayload = { ...variables, ...suggestedVariables };
      const { rest, charts } = splitChartsFromVariables(mergedPayload);
      setChartDatasets((prev) => ({ ...prev, ...charts }));
      handleVariablesUpdate(rest);
      setSuggestedVariables(null);
    }
  };

  const handleBack = () => {
    router.push('/dashboard/templates');
  };

  const addFont = () => {
    setFontsSelected([...fontsSelected, '--Select--your-font']);
  };

  const removeFont = (fontToRemove: string) => {
    setFontsSelected(fontsSelected.filter((f) => f !== fontToRemove));
  };

  const handleChangeFont = (selectedOption: { value: string }, index: number) => {
    const newFontsSelected = [...fontsSelected];
    newFontsSelected[index] = selectedOption.value;
    setFontsSelected(newFontsSelected);
  };

  const updateTemplate = async () => {
    try {
      if (!isPdfContentPaddingValid(pdfContentPadding)) {
        notificationService.showErrorNotification(
          'Padding PDF invalide (ex. 12px, 1.5rem, none ou vide).',
        );
        return;
      }
      const resolvedName = templateName.trim() || template?.name?.trim() || '';
      if (!resolvedName) {
        notificationService.showErrorNotification('Le nom du template ne peut pas être vide.');
        return;
      }
      const updated = await templateApi.updateTemplate(template?.ID as number, {
        ...template,
        name: resolvedName,
        content: code,
        variables: mergedTemplateData,
        fonts: fontsSelected,
        pdf_background_color: pdfBgColor,
        pdf_content_padding: pdfContentPadding,
      });
      setTemplate(updated);
      setTemplateName(updated.name?.trim() ?? '');
    } catch (error: any) {
      notificationService.showErrorNotification(error?.message || 'Error updating template');
    }
  };

  const [, drop] = useDrop({
    accept: 'VARIABLE',
    drop: (item: { varName: string; type: 'array' | 'object' | 'key-value' }) => {
      if (editorRef.current) {
        const position = editorRef.current.getPosition();
        const range = {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        };
        const id = { major: 1, minor: 1 }; // unique identifier for the op
        let text = '';

        switch (item.type) {
          case 'array': {
            const objectConcerned = variables[item.varName][0];
            const firstKeyName = Object.keys(objectConcerned)[0];
            text = `{{#each ${item.varName}}}\n\t{{this.${firstKeyName}}}\n{{/each}}`;
            break;
          }
          case 'object': {
            const firstKey = Object.keys(variables[item.varName])[0];
            text = `{{${item.varName}.${firstKey}}}`;
            break;
          }
          default: {
            text = `{{${item.varName}}}`;
            break;
          }
        }

        const op = { identifier: id, range, text, forceMoveMarkers: true };
        editorRef.current.executeEdits('my-source', [op]);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const uploadTemplate = (text: string): void => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template${Math.random()}.hbs`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddVariable = (): void => {
    openAddVariable();
  };

  const removeUploadedImage = (index: number) => {
    const fileToRemove = uploadedFiles[index];

    if (fileToRemove && fileToRemove.fileName && fileToRemove.fileId) {
      fetch('/api/delete-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: fileToRemove.fileName,
          fileId: fileToRemove.fileId,
        }),
      })
        .then((response) => response.json())
        .then((result) => {
          if (!result.success) {
            notificationService.showErrorNotification('Failed to delete image from Backblaze');
          }
        })
        .catch(() => {
          notificationService.showErrorNotification('Error deleting image from Backblaze');
        });
    }

    setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearImages = () => {
    uploadedFiles.forEach((file) => {
      if (file && file.fileName && file.fileId) {
        fetch('/api/delete-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.fileName,
            fileId: file.fileId,
          }),
        })
          .then((response) => response.json())
          .then((result) => {
            if (!result.success) {
              notificationService.showErrorNotification('Failed to delete image from Backblaze');
            }
          })
          .catch(() => {
            notificationService.showErrorNotification('Error deleting image from Backblaze');
          });
      }
    });

    setUploadedUrls([]);
    setUploadedFiles([]);
  };

  const handleDropAndUpload = async (acceptedFiles: FileWithPath[]): Promise<void> => {
    const remaining = 5 - uploadedUrls.length;
    const limited = acceptedFiles.slice(0, remaining);
    if (limited.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      limited.forEach((file) => formData.append('files', file));
      const response = await fetch('/api/upload-image', { method: 'POST', body: formData });
      const uploadData = await response.json();
      if (uploadData.urls && Array.isArray(uploadData.urls) && uploadData.files) {
        setUploadedUrls((prev) => [...prev, ...uploadData.urls].slice(0, 5));
        setUploadedFiles((prev) =>
          [
            ...prev,
            ...uploadData.files.map((f: any) => ({
              url: f.url,
              fileName: f.fileName,
              fileId: f.public_id,
            })),
          ].slice(0, 5),
        );
        notificationService.showSuccessNotification('Images téléversées');
      } else {
        throw new Error('Failed to upload images');
      }
    } catch (error: any) {
      notificationService.showErrorNotification(error?.message || 'Erreur lors du téléversement');
    } finally {
      setIsUploading(false);
    }
  };

  const applyGenerationResult = (
    content: string,
    suggestedVariables: Record<string, unknown> | undefined,
    recommendedLandscape: boolean,
  ): void => {
    if (suggestedVariables) {
      const { rest, charts } = splitChartsFromVariables(suggestedVariables);
      setChartDatasets((prev) => ({ ...prev, ...charts }));
      handleVariablesUpdate(rest);
      setSuggestedVariables(suggestedVariables);
    }
    const formatted = normalizeEditorHtmlFragment(content);
    setCode(formatted);
    setTemplateContent(formatted);
    setEditorSessionKey((k) => k + 1);
    setIsLandScape(recommendedLandscape);
  };

  const goToMarketplacePublishForm = (): void => {
    if (!template?.ID) return;
    router.push(`/marketplace/add?templateId=${template.ID}`);
  };

  const exportPdf = async (): Promise<void> => {
    if (!template) return;
    if (!isPdfContentPaddingValid(pdfContentPadding)) {
      notificationService.showErrorNotification('Padding PDF invalide.');
      return;
    }
    const yieldPaint = () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

    setExportPdfProgress({ opened: true, activeStep: 0, error: null });
    await yieldPaint();

    try {
      const renderedContent = await prepareRenderedHtml(code, mergedTemplateData, {
        paperSize: format,
        isLandscape: isLandScape,
        pdfContentPadding,
        pdfBackgroundColor: pdfBgColor,
        fonts: fontsSelected,
      });

      setExportPdfProgress({ opened: true, activeStep: 1, error: null });
      await yieldPaint();

      const exportId = String(template.uuid ?? template.ID);
      const blob = await templateApi.exportTemplate({
        templateId: exportId,
        format: 'pdf',
        variables: mergedTemplateData,
        paperSize: format,
        isLandscape: isLandScape,
        fonts: fontsSelected,
        renderedHtml: renderedContent,
        pdf_background_color: pdfBgColor,
        pdf_content_padding: pdfContentPadding,
      });

      setExportPdfProgress({ opened: true, activeStep: 2, error: null });
      await yieldPaint();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(template.name || 'export').replace(/[^\w.-]+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setExportPdfProgress({ opened: true, activeStep: 3, error: null });
      window.setTimeout(() => {
        setExportPdfProgress(null);
      }, 2400);
    } catch {
      setExportPdfProgress({
        opened: true,
        activeStep: 0,
        error: "L'export n'a pas pu aboutir. Réessayez dans un instant.",
      });
    }
  };

  const openChartJsonEditor = (chartId: string) => {
    setChartEditId(chartId);
    setChartEditJson(JSON.stringify(chartDatasets[chartId] ?? {}, null, 2));
    closeChartsHub();
    openChartJsonModal();
  };

  const applyChartJsonEdit = () => {
    if (!chartEditId) return;
    try {
      const parsed = parseChartJsonFile(chartEditJson) as unknown;
      setChartDatasets((prev) => ({ ...prev, [chartEditId]: parsed }));
      closeChartJsonModal();
      notificationService.showSuccessNotification('Données du graphique mises à jour');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'JSON invalide';
      notificationService.showErrorNotification(msg);
    }
  };

  const beginChartFileImport = (chartId: string) => {
    chartImportTargetIdRef.current = chartId;
    closeChartsHub();
    chartFileInputRef.current?.click();
  };

  const onChartFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const chartId = chartImportTargetIdRef.current;
    const file = e.target.files?.[0];
    e.target.value = '';
    chartImportTargetIdRef.current = null;
    if (!chartId || !file) return;
    try {
      const lower = file.name.toLowerCase();
      let payload: unknown;
      if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
        const buf = await file.arrayBuffer();
        payload = parseChartExcelFile(buf);
      } else if (lower.endsWith('.csv') || lower.endsWith('.txt')) {
        const text = await file.text();
        payload = parseChartCsvWithPapa(text);
      } else {
        const text = await file.text();
        payload = parseChartJsonFile(text);
      }
      setChartDatasets((prev) => ({ ...prev, [chartId]: payload }));
      notificationService.showSuccessNotification('Données du graphique importées');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Import impossible';
      notificationService.showErrorNotification(msg);
    }
  };

  // Initialize the tour when the component mounts
  useEffect(() => {
    // Only start the tour after the template has loaded
    if (isLoading === RequestStatus.Succeeded) {
      // Use setTimeout to ensure the DOM is fully rendered
      const tourTimeout = setTimeout(() => {
        // Check if tour target elements exist
        const elements = [
          '#editor-container',
          '#preview-container',
          '#variables-section',
          '#paper-settings',
          '#fonts-section',
          '#charts-section',
          '#sidebar-export-button',
          '#ai-generate-button',
          '#action-icon',
          '#save-button',
        ];

        // Verify all elements exist
        const allElementsExist = elements.every((selector) => {
          const el = document.querySelector(selector);
          return !!el;
        });

        if (!allElementsExist) {
          return;
        }

        try {
          // Only show the tour if the user hasn't seen it before
          if (!hasSeenTour) {
            manuallyStartTour(() => {
              setHasSeenTour(true);
            });
          }
        } catch (error) {
          // Silently handle tour errors
        }

        setShowTourButton(true);
      }, 1500); // Increased timeout to ensure DOM is fully rendered

      return () => clearTimeout(tourTimeout);
    }
    return undefined;
  }, [isLoading, hasSeenTour, setHasSeenTour]);

  return (
    <Stack style={{ overflow: 'hidden', position: 'relative' }} gap={0}>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/driver.js@1.3.5/dist/driver.css"
        />
      </Head>
      {/* Manage variable */}
      <AddVariable
        opened={addVariableOpened}
        onClose={closeAddVariable}
        jsonContent={jsonContent}
        setJsonContent={setJsonContent}
      />

      {exportPdfProgress ? (
        <ExportPdfProgress
          opened={exportPdfProgress.opened}
          activeStep={exportPdfProgress.activeStep}
          error={exportPdfProgress.error}
          onDismiss={() => setExportPdfProgress(null)}
        />
      ) : null}

      {/* AI Chat Drawer */}
      <Drawer
        keepMounted
        opened={promptDrawerOpened}
        onClose={closePromptDrawer}
        title="Assistant IA"
        position="right"
        size="lg"
        styles={{
          header: {
            backgroundColor: '#1A1B1E',
            color: 'white',
            padding: '0.75rem 1rem',
            borderBottom: '1px solid #373A40',
          },
          body: {
            padding: 0,
            height: '100%',
          },
          content: {
            backgroundColor: '#1A1B1E',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
          },
          close: {
            color: 'white',
          },
        }}
      >
        <AiChatPanel
          currentHtml={code}
          variables={variables}
          format={format}
          isLandscape={isLandScape}
          pdfContentPadding={pdfContentPadding}
          creditsUsed={creditsUsed}
          creditsLimit={creditsLimit}
          creditsRemaining={creditsRemaining}
          uploadedUrls={uploadedUrls}
          isUploading={isUploading}
          messages={chatMessages}
          setMessages={setChatMessages}
          inputText={chatInputDraft}
          setInputText={setChatInputDraft}
          onDrop={handleDropAndUpload}
          onClearImages={clearImages}
          onRemoveImage={removeUploadedImage}
          onResultApply={applyGenerationResult}
          onCreditsRefresh={refreshAiCredits}
          onClearConversation={() => {
            setChatMessages([]);
            setChatInputDraft('');
          }}
        />
      </Drawer>

      {/* Template Selection Drawer */}
      <Drawer
        opened={templateDrawerOpened}
        onClose={closeTemplateDrawer}
        title="Choisir un modèle"
        position="right"
        size="lg"
        styles={{
          header: {
            backgroundColor: '#1A1B1E',
            color: 'white',
            padding: '1rem',
            borderBottom: '1px solid #373A40',
          },
          content: {
            backgroundColor: '#1A1B1E',
            color: 'white',
          },
          close: { color: 'white' },
        }}
      >
        <Box px="md" pt="md" pb="xs">
          <TextInput
            placeholder="Rechercher un modèle..."
            leftSection={<IconSearch size={14} />}
            value={templateSearch}
            onChange={(e) => setTemplateSearch(e.currentTarget.value)}
            styles={{
              input: { backgroundColor: '#25262B', borderColor: '#373A40', color: 'white' },
            }}
            mb="sm"
          />
          <Tabs
            value={templateTab}
            onChange={(v) => {
              setTemplateTab(v || 'default');
              if (v === 'marketplace') loadMarketplaceTemplates();
            }}
            styles={{
              tab: { color: '#909296' },
              list: { borderColor: '#373A40' },
            }}
          >
            <Tabs.List>
              <Tabs.Tab value="default">Défaut ({REFERENCE_TEMPLATES.length})</Tabs.Tab>
              <Tabs.Tab value="marketplace">Marketplace</Tabs.Tab>
            </Tabs.List>

            {/* ─── Default tab ─────────────────────────── */}
            <Tabs.Panel value="default">
              <ScrollArea h="calc(100vh - 200px)" mt="md">
                {(() => {
                  const q = templateSearch.toLowerCase();
                  const filtered = q
                    ? REFERENCE_TEMPLATES.filter(
                        (t) => t.name.toLowerCase().includes(q) || t.type.toLowerCase().includes(q),
                      )
                    : REFERENCE_TEMPLATES;

                  const groups: Record<string, typeof filtered> = {};
                  filtered.forEach((t) => {
                    if (!groups[t.type]) groups[t.type] = [];
                    groups[t.type].push(t);
                  });

                  const typeLabel: Record<string, string> = {
                    invoice: 'Factures',
                    resume: 'CV',
                    report: 'Rapports',
                    other: 'Autres documents',
                  };
                  const typeColor: Record<string, string> = {
                    invoice: 'blue',
                    resume: 'green',
                    report: 'violet',
                    other: 'gray',
                  };

                  if (filtered.length === 0) {
                    return (
                      <Center h={200}>
                        <Text c="dimmed" size="sm">
                          Aucun modèle trouvé
                        </Text>
                      </Center>
                    );
                  }

                  return (
                    <Stack gap="xl">
                      {Object.entries(groups).map(([type, items]) => (
                        <Box key={type}>
                          <Group mb="sm">
                            <Text size="sm" fw={600} c="white">
                              {typeLabel[type] || type}
                            </Text>
                            <Badge size="sm" color={typeColor[type] || 'gray'}>
                              {items.length}
                            </Badge>
                          </Group>
                          <SimpleGrid cols={2} spacing="sm">
                            {items.map((templateItem) => (
                              <Card
                                key={templateItem.id}
                                padding="sm"
                                radius="md"
                                withBorder
                                styles={{
                                  root: {
                                    borderColor:
                                      selectedTemplateId === templateItem.id
                                        ? '#3B82F6'
                                        : '#373A40',
                                    backgroundColor: '#25262B',
                                    cursor: 'pointer',
                                  },
                                }}
                                onClick={() => handleTemplateSelect(templateItem)}
                              >
                                <Group justify="space-between" wrap="nowrap">
                                  <Text
                                    size="sm"
                                    fw={500}
                                    c="white"
                                    lineClamp={1}
                                    style={{ flex: 1 }}
                                  >
                                    {templateItem.name}
                                  </Text>
                                  {selectedTemplateId === templateItem.id && (
                                    <Badge size="xs" color="blue">
                                      ✓
                                    </Badge>
                                  )}
                                </Group>
                                <Text size="xs" c="dimmed" mt={4}>
                                  {templateItem.metadata.style} · {templateItem.metadata.complexity}
                                </Text>
                              </Card>
                            ))}
                          </SimpleGrid>
                        </Box>
                      ))}
                    </Stack>
                  );
                })()}
              </ScrollArea>
            </Tabs.Panel>

            {/* ─── Marketplace tab ─────────────────────── */}
            <Tabs.Panel value="marketplace">
              <ScrollArea h="calc(100vh - 200px)" mt="md">
                {marketplaceLoading ? (
                  <Center h={200}>
                    <Loader color="blue" />
                  </Center>
                ) : (
                  (() => {
                    const q = templateSearch.toLowerCase();
                    const filtered = q
                      ? marketplaceTemplates.filter(
                          (t) =>
                            t.name?.toLowerCase().includes(q) ||
                            t.category?.toLowerCase().includes(q) ||
                            (t.description && t.description.toLowerCase().includes(q)),
                        )
                      : marketplaceTemplates;

                    if (!marketplaceLoaded) {
                      return (
                        <Center h={200}>
                          <Text c="dimmed" size="sm">
                            Ouvrez l'onglet pour charger les modèles
                          </Text>
                        </Center>
                      );
                    }

                    if (filtered.length === 0) {
                      return (
                        <Center h={200}>
                          <Text c="dimmed" size="sm">
                            {q
                              ? 'Aucun modèle trouvé'
                              : 'Aucun modèle disponible sur le Marketplace'}
                          </Text>
                        </Center>
                      );
                    }

                    return (
                      <Stack gap="xs" maw={300} mx="auto">
                        {filtered.map((tpl) => {
                          const isFree = !tpl.price || tpl.price === 0;
                          return (
                            <Card
                              key={tpl.ID}
                              padding="xs"
                              radius="md"
                              withBorder
                              styles={{
                                root: {
                                  borderColor:
                                    selectedTemplateId === String(tpl.ID) ? '#3B82F6' : '#373A40',
                                  backgroundColor: '#25262B',
                                  cursor: isFree ? 'pointer' : 'default',
                                  opacity: isFree ? 1 : 0.7,
                                  overflow: 'hidden',
                                  maxWidth: '100%',
                                },
                              }}
                              onClick={() => isFree && handleMarketplaceSelect(tpl)}
                            >
                              <Box>
                                <Group justify="space-between" wrap="nowrap" gap={6} mb={4}>
                                  <Text
                                    size="xs"
                                    fw={600}
                                    c="white"
                                    lineClamp={1}
                                    style={{ flex: 1 }}
                                  >
                                    {tpl.name}
                                  </Text>
                                  {isFree ? (
                                    <Badge size="xs" color="green">
                                      Gratuit
                                    </Badge>
                                  ) : (
                                    <Badge
                                      size="xs"
                                      color="orange"
                                      leftSection={<IconLock size={10} />}
                                    >
                                      {tpl.price}€
                                    </Badge>
                                  )}
                                </Group>
                                {tpl.description?.trim() ? (
                                  <Text size="xs" c="dimmed" lineClamp={2} mb={4}>
                                    {tpl.description.trim()}
                                  </Text>
                                ) : null}
                                {tpl.category && (
                                  <Text size="xs" c="dimmed">
                                    {tpl.category}
                                  </Text>
                                )}
                              </Box>
                            </Card>
                          );
                        })}
                      </Stack>
                    );
                  })()
                )}
              </ScrollArea>
            </Tabs.Panel>
          </Tabs>
        </Box>
      </Drawer>

      <input
        ref={chartFileInputRef}
        type="file"
        accept=".json,.csv,.txt,.xlsx,.xls,application/json,text/csv,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        style={{ display: 'none' }}
        onChange={onChartFileSelected}
      />

      <Modal
        opened={chartsHubOpened}
        onClose={closeChartsHub}
        title="Données des graphiques"
        size="md"
        centered
      >
        <ScrollArea mah={480}>
          <Stack gap="sm">
            <Text size="xs" c="dimmed">
              CSV / Excel (1re feuille) : 1re colonne = libellés, colonnes suivantes = séries
              numériques. Scatter / bubble : JSON Chart.js recommandé.
            </Text>
            {extractChartBindingsFromTemplate(code).map(({ chartId, chartType }) => {
              const raw = chartDatasets[chartId];
              const hasData = raw != null;
              const valid = hasData && isChartDataValidForType(raw, chartType ?? null);
              let statusLabel = 'Manquant';
              let statusColor: 'teal' | 'orange' | 'red' = 'orange';
              if (hasData && valid) {
                statusLabel = 'OK';
                statusColor = 'teal';
              } else if (hasData && !valid) {
                statusLabel = 'Invalide';
                statusColor = 'red';
              }
              return (
                <Box
                  key={chartId}
                  p="xs"
                  style={{
                    border: '1px solid #373A40',
                    borderRadius: 8,
                    background: '#25262B',
                  }}
                >
                  <Group justify="space-between" wrap="nowrap" gap={6}>
                    <Text size="xs" c="white" lineClamp={1} style={{ flex: 1 }}>
                      {chartId}
                      {chartType ? ` · ${chartType}` : ''}
                    </Text>
                    <Badge size="xs" color={statusColor}>
                      {statusLabel}
                    </Badge>
                  </Group>
                  <Group gap={6} mt={8}>
                    <Button size="xs" variant="light" onClick={() => openChartJsonEditor(chartId)}>
                      Modifier JSON
                    </Button>
                    <Button
                      size="xs"
                      variant="default"
                      onClick={() => beginChartFileImport(chartId)}
                    >
                      Importer fichier
                    </Button>
                  </Group>
                </Box>
              );
            })}
          </Stack>
        </ScrollArea>
      </Modal>

      <Modal
        opened={chartJsonModalOpened}
        onClose={closeChartJsonModal}
        title={chartEditId ? `Données Chart.js — ${chartEditId}` : 'Données graphique'}
        size="90%"
        centered
        styles={{
          content: { maxWidth: 1120 },
          body: { maxHeight: 'calc(100vh - 100px)' },
        }}
      >
        <Stack gap="md">
          <Text size="xs" c="dimmed">
            Objet au format Chart.js : propriétés <code>labels</code> (sauf scatter/bubble) et{' '}
            <code>datasets</code> non vide.
          </Text>
          <Box
            style={{
              border: '1px solid #373A40',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            {monacoReady ? (
              <Editor
                key={chartEditId ?? 'chart-json'}
                height="clamp(380px, 62vh, 720px)"
                language="json"
                theme="vs-dark"
                value={chartEditJson}
                onChange={(v) => setChartEditJson(v ?? '')}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  fontSize: 13,
                  tabSize: 2,
                  automaticLayout: true,
                }}
              />
            ) : (
              <Center h="clamp(380px, 62vh, 720px)">
                <Loader size="sm" />
              </Center>
            )}
          </Box>
          <Group justify="flex-end">
            <Button variant="default" onClick={closeChartJsonModal}>
              Annuler
            </Button>
            <Button onClick={applyChartJsonEdit}>Appliquer</Button>
          </Group>
        </Stack>
      </Modal>

      {/* NavBar */}
      <Group
        h={rem(60)}
        px="xl"
        bg="#1A1B1E"
        justify="space-between"
        style={{ borderBottom: '1px solid #373A40' }}
      >
        <Group gap="md">
          <Button
            onClick={handleBack}
            leftSection={<IconChevronLeft size={16} />}
            variant="subtle"
            color="gray"
            styles={{
              root: {
                color: '#909296',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#25262B',
                  transform: 'translateX(-2px)',
                },
              },
            }}
          >
            Return to dashboard
          </Button>
          <Text c="dimmed" span>
            /
          </Text>
          <TextInput
            value={templateName}
            onChange={(e) => setTemplateName(e.currentTarget.value)}
            placeholder={template?.name || 'Report_template'}
            variant="unstyled"
            size="sm"
            aria-label="Nom du template"
            styles={{
              root: { flex: '0 1 auto', minWidth: rem(140), maxWidth: rem(400) },
              input: {
                color: 'var(--mantine-color-white)',
                fontWeight: 500,
              },
            }}
          />
          <SegmentedControl
            id="view-mode-control"
            value={viewMode}
            onChange={(v) => setViewMode(v as 'single' | 'book')}
            data={[
              { label: 'Single', value: 'single' },
              { label: 'Book View', value: 'book' },
            ]}
            size="xs"
            styles={{
              root: { backgroundColor: '#25262B' },
              label: { color: '#909296' },
            }}
          />
        </Group>

        <Group gap="md">
          {showTourButton && (
            <Tooltip label="Show guided tour">
              <Button
                onClick={() => {
                  manuallyStartTour(() => {
                    setHasSeenTour(true);
                  });
                }}
                leftSection={<IconHelp size={16} />}
                variant="subtle"
                color="blue"
                styles={{
                  root: {
                    transition: 'all 0.2s ease',
                    '&:hover': { transform: 'translateY(-1px)' },
                  },
                }}
              >
                Help Tour
              </Button>
            </Tooltip>
          )}

          <Tooltip label="Choose a template model">
            <Button
              id="models-button"
              onClick={openTemplateDrawer}
              leftSection={<IconFileText size={16} />}
              variant="light"
              color="purple"
              styles={{
                root: {
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-1px)' },
                },
              }}
            >
              Models
            </Button>
          </Tooltip>
          <Tooltip label="Generate with AI">
            <Button
              id="ai-generate-button"
              onClick={openPromptDrawer}
              leftSection={<IconWand size={16} />}
              variant="light"
              color="blue"
              styles={{
                root: {
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-1px)' },
                },
              }}
            >
              AI Generate
            </Button>
          </Tooltip>

          {/* Actions Menu */}
          <Box id="action-icon">
            <Menu
              shadow="md"
              width={200}
              styles={{
                dropdown: { backgroundColor: '#ffffff', borderColor: '#dee2e6' },
                item: {
                  color: '#212529',
                  '&[data-hovered]': { backgroundColor: '#f1f3f5', color: '#212529' },
                },
                itemSection: { color: '#495057' },
                label: { color: '#868e96' },
                divider: { borderColor: '#dee2e6' },
              }}
            >
              <Menu.Target>
                <Button
                  variant="light"
                  color="gray"
                  leftSection={<IconDotsVertical size={16} />}
                  styles={{
                    root: {
                      transition: 'all 0.2s ease',
                      '&:hover': { transform: 'translateY(-1px)' },
                    },
                  }}
                >
                  Actions
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Document</Menu.Label>
                <Menu.Item
                  leftSection={<IconDownload size={16} />}
                  onClick={() => uploadTemplate(templateContent)}
                >
                  Download Template
                </Menu.Item>

                <Menu.Label>Export PDF</Menu.Label>
                <Menu.Item leftSection={<IconFileExport size={16} />} onClick={exportPdf}>
                  Export as {format.toUpperCase()} PDF
                </Menu.Item>

                <Divider />

                <Menu.Label>Marketplace</Menu.Label>
                <Menu.Item
                  leftSection={<IconShoppingCart size={16} />}
                  onClick={goToMarketplacePublishForm}
                >
                  Publish to Marketplace
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Box>

          <Button
            id="save-button"
            onClick={updateTemplate}
            variant="filled"
            color="blue"
            styles={{
              root: {
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-1px)' },
              },
            }}
          >
            Save
          </Button>
        </Group>
      </Group>

      {/* Main Content */}
      {!router.isReady || isLoading === RequestStatus.InProgress ? (
        <Center h="calc(100vh - 60px)" w="100%">
          <Loader size="lg" color="blue" />
        </Center>
      ) : (
        <Group gap={0} style={{ height: 'calc(100vh - 60px)', flexWrap: 'nowrap' }}>
          {/* Sidebar */}
          <Stack
            component={ScrollArea}
            w={sidebarCollapsed ? '40px' : '24%'}
            p={sidebarCollapsed ? 'xs' : 'lg'}
            h="100%"
            bg="#1A1B1E"
            style={{
              borderRight: '1px solid #373A40',
              transition: 'width 0.3s ease, padding 0.3s ease',
              overflow: 'hidden',
              flexShrink: 0,
            }}
            gap="xl"
          >
            {sidebarCollapsed ? (
              <Center>
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  onClick={() => setSidebarCollapsed(false)}
                  style={{
                    marginTop: '10px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <IconChevronRight size={20} />
                </ActionIcon>
              </Center>
            ) : (
              <>
                <Group justify="space-between">
                  <Text size="sm" fw={600} c="white" mb="md" fs="uppercase">
                    Template settings
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => setSidebarCollapsed(true)}
                    style={{
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <IconChevronLeft size={16} />
                  </ActionIcon>
                </Group>

                {/* Paper size and orientation */}
                <Group id="paper-settings" align="center" mb="lg">
                  <Select
                    size="sm"
                    label="Paper Size"
                    w={120}
                    onChange={(value) => {
                      const formatValue = (value as FormatType) || DEFAULT_FORMAT;
                      setFormat(formatValue);
                    }}
                    defaultValue={DEFAULT_FORMAT}
                    data={[
                      { label: 'A1', value: 'a1' },
                      { label: 'A2', value: 'a2' },
                      { label: 'A3', value: 'a3' },
                      { label: 'A4', value: 'a4' },
                      { label: 'A5', value: 'a5' },
                      { label: 'A6', value: 'a6' },
                    ]}
                    styles={{
                      root: { marginBottom: 0 },
                      input: {
                        backgroundColor: '#ffffff',
                        border: '1px solid #dee2e6',
                        color: '#212529',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: '#3B82F6',
                        },
                      },
                      label: {
                        color: '#909296',
                        fontSize: '0.75rem',
                        marginBottom: '0.25rem',
                      },
                      dropdown: {
                        backgroundColor: '#ffffff',
                        border: '1px solid #dee2e6',
                      },
                      option: {
                        color: '#212529',
                        '&[data-selected]': {
                          '&, &:hover': {
                            backgroundColor: '#e7f5ff',
                            color: '#1864ab',
                          },
                        },
                        '&[data-combobox-active]': { backgroundColor: '#f1f3f5', color: '#212529' },
                        '&[data-hovered]': { backgroundColor: '#f1f3f5', color: '#212529' },
                        '&:hover': { backgroundColor: '#f1f3f5' },
                      },
                      section: { color: '#495057' },
                    }}
                  />
                  <Checkbox
                    checked={isLandScape}
                    onChange={(event) => setIsLandScape(event.currentTarget.checked)}
                    label="Landscape"
                    styles={{
                      label: {
                        color: '#909296',
                      },
                    }}
                  />
                </Group>

                {/* PDF Styles — Page Background */}
                <Box id="pdf-styles-section">
                  <Text size="sm" fw={600} c="white" mb="xs" fs="uppercase">
                    PDF Styles
                  </Text>
                  <Text size="xs" c="dimmed" mb="xs">
                    Page Background
                  </Text>
                  <Group gap={6} mb="xs">
                    {['#FFFFFF', '#F3F4F6', '#DBEAFE', '#FEF3C7', '#1F2937'].map((color) => (
                      <ColorSwatch
                        key={color}
                        color={color}
                        size={24}
                        style={{
                          cursor: 'pointer',
                          border: pdfBgColor === color ? '2px solid #228be6' : '2px solid #373A40',
                        }}
                        onClick={() => setPdfBgColor(color)}
                      />
                    ))}
                  </Group>
                  <ColorInput
                    size="xs"
                    value={pdfBgColor}
                    onChange={setPdfBgColor}
                    format="hex"
                    label="Hex Code"
                    styles={{
                      label: { color: '#909296', fontSize: '11px' },
                      input: { backgroundColor: '#25262b', color: 'white', borderColor: '#373A40' },
                    }}
                  />
                  <Text size="xs" c="dimmed" mt="md" mb="xs">
                    Padding du contenu (PDF / aperçu)
                  </Text>
                  <TextInput
                    size="xs"
                    placeholder="Vide = 2rem (défaut)"
                    value={pdfContentPadding}
                    onChange={(e) => setPdfContentPadding(e.currentTarget.value)}
                    description="Ex. 16px, 1.5rem, none ou 0 pour aucun"
                    styles={{
                      label: { color: '#909296', fontSize: '11px' },
                      input: { backgroundColor: '#25262b', color: 'white', borderColor: '#373A40' },
                      description: { color: '#868e96', fontSize: '10px' },
                    }}
                  />
                  <Group gap="xs" mt="xs" wrap="wrap">
                    <Button
                      size="xs"
                      variant="default"
                      onClick={() => setPdfContentPadding('none')}
                    >
                      Aucun padding
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      color="gray"
                      onClick={() => {
                        setPdfContentPadding('');
                        setPdfBgColor('#FFFFFF');
                      }}
                    >
                      Réinitialiser options PDF
                    </Button>
                  </Group>
                </Box>

                {/* Export format */}
                <Box>
                  <Text size="sm" fw={600} c="white" mb="md" fs="uppercase">
                    Export Settings
                  </Text>
                  <Text size="xs" c="dimmed" mb="md">
                    PDF export will use the paper size and orientation selected above.
                  </Text>
                  <Button
                    id="sidebar-export-button"
                    fullWidth
                    leftSection={<IconFileExport size={16} />}
                    onClick={exportPdf}
                    variant="light"
                    color="blue"
                    styles={{
                      root: {
                        transition: 'all 0.2s ease',
                        '&:hover': { transform: 'translateY(-1px)' },
                      },
                    }}
                    mb="md"
                  >
                    Export as {format.toUpperCase()} PDF
                  </Button>
                </Box>

                {/* Start from Template section */}
                <Box>
                  <Text size="sm" fw={600} c="white" mb="md" fs="uppercase">
                    Templates
                  </Text>
                  <Text size="xs" c="dimmed" mb="md">
                    Start from a pre-built template
                  </Text>
                  <Button
                    fullWidth
                    leftSection={<IconFileText size={16} />}
                    onClick={openTemplateDrawer}
                    variant="light"
                    color="purple"
                    styles={{
                      root: {
                        transition: 'all 0.2s ease',
                        '&:hover': { transform: 'translateY(-1px)' },
                      },
                    }}
                    mb="md"
                  >
                    Start from Template
                  </Button>
                  {selectedTemplateId && (
                    <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                      Template selected
                    </Text>
                  )}
                </Box>

                {/* Variables section */}
                <Box id="variables-section">
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" fw={600} c="white" fs="uppercase">
                      Variables
                    </Text>
                    <Tooltip label="Add variables">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={handleAddVariable}
                        style={{
                          transition: 'all 0.2s ease',
                          '&:hover': { transform: 'scale(1.1)' },
                        }}
                      >
                        <IconPlus size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                  <Text size="xs" c="dimmed" mb="md">
                    How to use variables?
                  </Text>

                  {/* Variables list */}
                  <Box
                    style={{
                      maxHeight: '200px',
                      overflowY: 'auto',
                      padding: '0.5rem',
                      backgroundColor: '#25262B',
                      borderRadius: '8px',
                    }}
                  >
                    <Group gap="xs" style={{ flexWrap: 'wrap' }}>
                      {Object.entries(variables).map(([varName, value]) => {
                        let type = 'object';
                        if (Array.isArray(value)) {
                          type = 'array';
                        } else if (typeof value === 'object' && value !== null) {
                          type = 'object';
                        } else {
                          type = 'key-value';
                        }
                        return <VariableBadge key={varName} varName={varName} type={type} />;
                      })}
                    </Group>
                  </Box>
                </Box>

                {/* Stylesheet section */}
                <Box>
                  <Text size="sm" fw={600} c="white" mb="md" fs="uppercase">
                    Stylesheet
                  </Text>
                  <Select
                    value="tailwind"
                    data={[{ value: 'tailwind', label: 'Tailwind CSS' }]}
                    styles={{
                      input: {
                        backgroundColor: '#ffffff',
                        border: '1px solid #dee2e6',
                        color: '#212529',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: '#3B82F6',
                        },
                      },
                      dropdown: {
                        backgroundColor: '#ffffff',
                        border: '1px solid #dee2e6',
                      },
                      option: {
                        color: '#212529',
                        '&[data-selected]': {
                          '&, &:hover': {
                            backgroundColor: '#e7f5ff',
                            color: '#1864ab',
                          },
                        },
                        '&[data-combobox-active]': { backgroundColor: '#f1f3f5', color: '#212529' },
                        '&[data-hovered]': { backgroundColor: '#f1f3f5', color: '#212529' },
                        '&:hover': { backgroundColor: '#f1f3f5' },
                      },
                      section: { color: '#495057' },
                    }}
                  />
                </Box>

                {/* Fonts section */}
                <Box id="fonts-section">
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" fw={600} c="white" fs="uppercase">
                      Fonts
                    </Text>
                    <Tooltip label="Add font">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={addFont}
                        style={{
                          transition: 'all 0.2s ease',
                          '&:hover': { transform: 'scale(1.1)' },
                        }}
                      >
                        <IconPlus size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                  <Stack gap="xs">
                    {fontsSelected.map((font, index) => (
                      <Group key={font} align="center">
                        <Select
                          size="sm"
                          value={font}
                          onChange={(value) => handleChangeFont({ value: value || '' }, index)}
                          data={fonts}
                          searchable
                          placeholder="Search font..."
                          nothingFoundMessage="No font found"
                          style={{ flex: 1 }}
                          styles={{
                            input: {
                              backgroundColor: '#ffffff',
                              border: '1px solid #dee2e6',
                              color: '#212529',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                borderColor: '#3B82F6',
                              },
                            },
                            dropdown: {
                              backgroundColor: '#ffffff',
                              border: '1px solid #dee2e6',
                            },
                            option: {
                              color: '#212529',
                              '&[data-selected]': {
                                '&, &:hover': {
                                  backgroundColor: '#e7f5ff',
                                  color: '#1864ab',
                                },
                              },
                              '&[data-combobox-active]': {
                                backgroundColor: '#f1f3f5',
                                color: '#212529',
                              },
                              '&[data-hovered]': { backgroundColor: '#f1f3f5', color: '#212529' },
                              '&:hover': { backgroundColor: '#f1f3f5' },
                            },
                            section: { color: '#495057' },
                          }}
                        />
                        {index !== 0 && (
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => removeFont(font)}
                            style={{
                              transition: 'all 0.2s ease',
                              '&:hover': { transform: 'scale(1.1)' },
                            }}
                          >
                            <IconMinus size={16} />
                          </ActionIcon>
                        )}
                      </Group>
                    ))}
                  </Stack>
                </Box>

                {/* Charts section */}
                <Stack id="charts-section" gap="sm" mah={520} style={{ overflow: 'auto' }}>
                  <Box p="xs">
                    <Text size="sm" fw={600} c="white" mb="xs" tt="uppercase">
                      Graphiques
                    </Text>
                    <Text size="xs" c="dimmed" mb="sm">
                      Ajoutez un type ci-dessous. Les données sont séparées du JSON « variables »
                      (panneau ci-dessous).
                    </Text>
                    {(() => {
                      const bindings = extractChartBindingsFromTemplate(code);
                      if (bindings.length === 0) return null;
                      return (
                        <Button
                          fullWidth
                          size="xs"
                          variant="light"
                          leftSection={<IconChartDots size={14} />}
                          onClick={openChartsHub}
                          mb="md"
                        >
                          Gérer les données des graphiques ({bindings.length})
                        </Button>
                      );
                    })()}
                    <SimpleGrid cols={2} spacing="xs">
                      {Object.entries(CHART_TYPES).map(([type, label]) => (
                        <Box
                          key={type}
                          onClick={() => {
                            const editor = editorRef.current;
                            if (!editor) {
                              notificationService.showErrorNotification(
                                'Éditeur non prêt — réessayez dans une seconde.',
                              );
                              return;
                            }
                            const model = editor.getModel();
                            if (!model) {
                              notificationService.showErrorNotification(
                                'Modèle éditeur introuvable.',
                              );
                              return;
                            }

                            const lastLine = model.getLineCount();
                            const lastLineContent = model.getLineContent(lastLine);
                            const chartId = `${type}Chart${Math.random().toString(36).substr(2, 9)}`;
                            const chartData = generateChartData(type as keyof typeof CHART_TYPES);

                            setChartDatasets((prev) => ({
                              ...prev,
                              [chartId]: chartData,
                            }));

                            const text = `\n\n<!-- Chart Section -->
<div class="w-full py-4" style="display:flex;justify-content:center;align-items:center;">
  <canvas 
    id="${chartId}"
    data-chart-type="${type}"
    data-chart-data='{{charts.${chartId}}}'
    style="display:block;margin:0 auto;max-width:min(100%,42rem);width:100%;height:auto;"
  ></canvas>
</div>`;

                            const position = {
                              lineNumber: lastLine,
                              column: lastLineContent.length + 1,
                            };

                            const range = {
                              startLineNumber: position.lineNumber,
                              startColumn: position.column,
                              endLineNumber: position.lineNumber,
                              endColumn: position.column,
                            };

                            const op = {
                              identifier: { major: 1, minor: 1 },
                              range,
                              text,
                              forceMoveMarkers: true,
                            };

                            editor.executeEdits('chart-insert', [op]);
                          }}
                          style={{
                            backgroundColor: '#25262B',
                            padding: '12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            border: '1px solid #373A40',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <Stack gap={4} align="center">
                            <IconChartDots size={24} style={{ color: '#3B82F6' }} />
                            <Text size="xs" c="white" ta="center">
                              {label}
                            </Text>
                          </Stack>
                        </Box>
                      ))}
                    </SimpleGrid>
                  </Box>
                </Stack>
              </>
            )}
          </Stack>

          {/* Code editor */}
          <Box
            id="editor-container"
            style={{
              width: sidebarCollapsed ? 'calc(61% - 20px)' : '46%',
              height: '100%',
              backgroundColor: '#ffffff',
              transition: 'width 0.3s ease',
              flexShrink: 0,
              flexGrow: 0,
            }}
            ref={drop}
          >
            <DndProvider backend={HTML5Backend}>
              {monacoReady ? (
                <IDE
                  key={editorSessionKey}
                  onChange={(newCode) => {
                    setCode(newCode);
                    setTemplateContent(newCode);
                  }}
                  defaultValue={code}
                  editorDidMount={(editor) => {
                    editorRef.current = editor;
                  }}
                />
              ) : (
                <Center h="100%">
                  <Loader size="sm" />
                </Center>
              )}
            </DndProvider>
          </Box>

          {/* Preview */}
          <Box
            id="preview-container"
            style={
              isPreviewFullscreen
                ? {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 9999,
                    backgroundColor: '#1A1B1E',
                  }
                : {
                    width: sidebarCollapsed ? 'calc(39% - 20px)' : '30%',
                    height: '100%',
                    backgroundColor: '#1A1B1E',
                    borderLeft: '1px solid #373A40',
                    position: 'relative',
                    transition: 'width 0.3s ease',
                    flexShrink: 0,
                    flexGrow: 0,
                  }
            }
          >
            <Tooltip label={isPreviewFullscreen ? 'Exit fullscreen' : 'Fullscreen preview'}>
              <ActionIcon
                id="fullscreen-button"
                onClick={() => setIsPreviewFullscreen((v) => !v)}
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  zIndex: 10,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                }}
                variant="subtle"
                size="sm"
              >
                {isPreviewFullscreen ? (
                  <IconArrowsMinimize size={14} />
                ) : (
                  <IconArrowsMaximize size={14} />
                )}
              </ActionIcon>
            </Tooltip>
            <Box
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'auto',
                padding: '1rem 1rem 1rem 2.75rem',
              }}
            >
              <Preview
                format={format}
                htmlContent={code}
                renderedBodyHtml={previewRenderedHtml}
                data={mergedTemplateData}
                isLandscape={isLandScape}
                fonts={fontsSelected}
                setTemplateContent={setTemplateContent}
                backgroundColor={pdfBgColor}
                pdfContentPadding={pdfContentPadding}
                viewMode={viewMode}
                isFullscreen={isPreviewFullscreen}
              />
            </Box>
          </Box>
        </Group>
      )}
    </Stack>
  );
};

export const getServerSideProps: GetServerSideProps = async () => ({
  props: {},
});

export default CreateTemplate;
