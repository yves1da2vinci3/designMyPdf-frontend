import { driver, DriveStep, Driver } from 'driver.js';
import 'driver.js/dist/driver.css';

// Define tour steps for the template editor
export const templateEditorTourSteps: DriveStep[] = [
  {
    element: '#editor-container',
    popover: {
      title: 'Template Editor',
      description:
        'This is where you write your HTML template code. You can use Handlebars syntax to include dynamic variables.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    element: '#preview-container',
    popover: {
      title: 'Live Preview',
      description:
        'See a real-time preview of your template as you edit. The preview updates automatically as you type.',
      side: 'left' as const,
      align: 'start' as const,
    },
  },
  {
    element: '#variables-section',
    popover: {
      title: 'Variables',
      description:
        'Manage your template variables here. You can add, edit, or remove variables that will be used in your template.',
      side: 'top' as const,
      align: 'start' as const,
    },
  },
  {
    element: '#paper-settings',
    popover: {
      title: 'Paper Settings',
      description: 'Choose your paper size and orientation for the PDF export.',
      side: 'top' as const,
      align: 'start' as const,
    },
  },
  {
    element: '#fonts-section',
    popover: {
      title: 'Fonts',
      description:
        'Select fonts to use in your template. You can add multiple fonts and they will be loaded automatically.',
      side: 'top' as const,
      align: 'start' as const,
    },
  },
  {
    element: '#charts-section',
    popover: {
      title: 'Charts',
      description:
        'Add interactive charts to your template. Click on a chart type to insert it into your template.',
      side: 'top' as const,
      align: 'start' as const,
    },
  },
  {
    element: '#sidebar-export-button',
    popover: {
      title: 'Export PDF',
      description: "When you're ready, export your template as a PDF document with this button.",
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '#ai-generate-button',
    popover: {
      title: 'AI Generation',
      description:
        'Let AI help you create templates! Describe what you want, and our AI will generate a template for you.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '#action-icon',
    popover: {
      title: 'Actions for template',
      description:
        'You can download your template as a PDF, as handlebars file or Publish your template to the public',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '#save-button',
    popover: {
      title: 'Save Template',
      description: "Don't forget to save your work! Click here to save your template.",
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
];

// Define tour steps for the templates dashboard
export const templatesDashboardTourSteps: DriveStep[] = [
  {
    element: '#templates-header',
    popover: {
      title: 'Templates Dashboard',
      description: 'This is your templates dashboard where you can manage all your PDF templates.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '#create-template-button',
    popover: {
      title: 'Create New Template',
      description: 'Click here to create a new PDF template from scratch.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '#create-folder-button',
    popover: {
      title: 'Create New Folder',
      description: 'Organize your templates by creating folders to group related templates together.',
      side: 'bottom' as const,
      align: 'center' as const,
    },
  },
  {
    element: '#folders-section',
    popover: {
      title: 'Folders',
      description: 'Navigate between different folders to organize your templates. You can also drag and drop templates to move them between folders.',
      side: 'right' as const,
      align: 'start' as const,
    },
  },
  {
    element: '#search-templates',
    popover: {
      title: 'Search Templates',
      description: 'Quickly find templates by searching for their names.',
      side: 'bottom' as const,
      align: 'start' as const,
    },
  },
  {
    element: '#templates-grid',
    popover: {
      title: 'Templates',
      description: 'Your templates are displayed here. Click on a template to edit it, or use the menu to perform other actions.',
      side: 'top' as const,
      align: 'center' as const,
    },
  },
  {
    element: '#template-actions',
    popover: {
      title: 'Template Actions',
      description: 'Each template has a menu with actions like edit, duplicate, download, or delete.',
      side: 'left' as const,
      align: 'center' as const,
    },
  },
];

// Function to start the template editor tour
export function startTemplateEditorTour(
  hasSeenTour: boolean = false,
  onComplete?: () => void,
): Driver | undefined {
  console.log('startTemplateEditorTour called with hasSeenTour:', hasSeenTour);

  // Skip if user has already seen the tour
  if (hasSeenTour) {
    console.log('User has already seen tour, skipping');
    return undefined;
  }

  try {
    console.log('Creating driver instance with steps:', templateEditorTourSteps);

    const driverObj = driver({
      showProgress: true,
      steps: templateEditorTourSteps,
      nextBtnText: 'Next',
      prevBtnText: 'Previous',
      doneBtnText: 'Done',
      onDestroyed: onComplete,
      stagePadding: 10,
      animate: true,
      allowClose: true,
      overlayOpacity: 0.6,
      smoothScroll: true,
      onHighlightStarted: (element) => {
        console.log('Highlighting element:', element);
        return true; // continue highlighting
      },
      onDeselected: (element) => {
        console.log('Element deselected:', element);
        return true; // continue
      },
    });

    // Start the tour
    console.log('Starting tour drive');
    driverObj.drive();
    console.log('Tour drive started');

    return driverObj;
  } catch (error) {
    console.error('Error in startTemplateEditorTour:', error);
    return undefined;
  }
}

// Function to start the templates dashboard tour
export function startTemplatesDashboardTour(
  hasSeenTour: boolean = false,
  onComplete?: () => void,
): Driver | undefined {
  console.log('startTemplatesDashboardTour called with hasSeenTour:', hasSeenTour);

  // Skip if user has already seen the tour
  if (hasSeenTour) {
    console.log('User has already seen tour, skipping');
    return undefined;
  }

  try {
    console.log('Creating driver instance with steps:', templatesDashboardTourSteps);

    const driverObj = driver({
      showProgress: true,
      steps: templatesDashboardTourSteps,
      nextBtnText: 'Next',
      prevBtnText: 'Previous',
      doneBtnText: 'Done',
      onDestroyed: onComplete,
      stagePadding: 10,
      animate: true,
      allowClose: true,
      overlayOpacity: 0.6,
      smoothScroll: true,
      onHighlightStarted: (element) => {
        console.log('Highlighting element:', element);
        return true; // continue highlighting
      },
      onDeselected: (element) => {
        console.log('Element deselected:', element);
        return true; // continue
      },
    });

    // Start the tour
    console.log('Starting tour drive');
    driverObj.drive();
    console.log('Tour drive started');

    return driverObj;
  } catch (error) {
    console.error('Error in startTemplatesDashboardTour:', error);
    return undefined;
  }
}

// Function to manually start the tour (for a button or help menu)
export function manuallyStartTour(onComplete?: () => void, tourType: 'editor' | 'dashboard' = 'editor'): Driver | undefined {
  console.log('manuallyStartTour called for', tourType);

  try {
    console.log('Creating driver instance for manual tour');
    
    const steps = tourType === 'editor' ? templateEditorTourSteps : templatesDashboardTourSteps;

    const driverObj = driver({
      showProgress: true,
      steps,
      nextBtnText: 'Next',
      prevBtnText: 'Previous',
      doneBtnText: 'Done',
      onDestroyed: onComplete,
      stagePadding: 10,
      animate: true,
      allowClose: true,
      overlayOpacity: 0.6,
      smoothScroll: true,
      onHighlightStarted: (element) => {
        console.log('Highlighting element (manual):', element);
        return true; // continue highlighting
      },
      onDeselected: (element) => {
        console.log('Element deselected (manual):', element);
        return true; // continue
      },
    });

    console.log('Starting manual tour drive');
    driverObj.drive();
    console.log('Manual tour drive started');

    return driverObj;
  } catch (error) {
    console.error('Error in manuallyStartTour:', error);
    return undefined;
  }
}

// Function to reset the tour (for testing or if user wants to see it again)
export function resetTour(tourType: 'editor' | 'dashboard' = 'editor'): void {
  console.log('Resetting tour state for', tourType);
  if (typeof window !== 'undefined') {
    const key = tourType === 'editor' ? 'hasSeenTemplateEditorTour' : 'hasSeenTemplatesDashboardTour';
    localStorage.removeItem(key);
    console.log('Tour state reset successfully');
  } else {
    console.warn('Cannot reset tour state: window is undefined (SSR context)');
  }
}
