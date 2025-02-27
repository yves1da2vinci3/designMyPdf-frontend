export interface Template {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail: string;
  rating: number;
  reviews: number;
  features: string[];
  content?: string;
  variables?: any;
  fonts?: string[];
  author?: {
    name: string;
    avatar: string;
  };
}

const mockTemplates: Template[] = [
  {
    id: '1',
    title: 'Business Report Template',
    description: 'Professional business report template with modern design',
    price: 49.99,
    category: 'business',
    thumbnail: '/templates/business-report.jpg',
    rating: 4.5,
    reviews: 18,
    features: ['4-Zone Design', 'Full HD Quality', 'Multiple Color Schemes'],
    content: '<div>Sample template content</div>',
    variables: {},
    fonts: [],
    author: {
      name: 'John Doe',
      avatar: 'https://placehold.co/100x100?text=Author+Avatar',
    },
  },
  {
    id: '2',
    title: 'Creative Portfolio',
    description: 'Showcase your work with this creative portfolio template',
    price: 39.99,
    category: 'creative',
    thumbnail: '/templates/creative-portfolio.jpg',
    rating: 4.8,
    reviews: 24,
    features: ['Customizable Sections', 'Modern Layout', 'Gallery Support'],
    content: '<div>Sample portfolio content</div>',
    variables: {},
    fonts: [],
    author: {
      name: 'Jane Smith',
      avatar: 'https://placehold.co/100x100?text=Author+Avatar',
    },
  },
  // Add more mock templates as needed
];

export const templateService = {
  getTemplates: async ({ search, category }: { search?: string; category?: string }) => {
    // Simulate API call delay
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 500);
    });

    let filteredTemplates = [...mockTemplates];

    if (search) {
      filteredTemplates = filteredTemplates.filter(
        (template) =>
          template.title.toLowerCase().includes(search.toLowerCase()) ||
          template.description.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (category) {
      filteredTemplates = filteredTemplates.filter((template) => template.category === category);
    }

    return { templates: filteredTemplates };
  },

  getTemplate: async (id: string): Promise<Template | null> => {
    // Simulate API call delay
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 500);
    });
    const template = mockTemplates.find((t) => t.id === id);
    return template || null;
  },

  downloadTemplate: async (templateId: string) => {
    // Simulate API call delay
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 500);
    });
    return { downloadUrl: `/api/templates/${templateId}/download` };
  },

  addTemplate: async (template: Omit<Template, 'id'>) => {
    // Simulate API call delay
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 500);
    });
    const newTemplate = {
      ...template,
      id: Math.random().toString(36).substr(2, 9),
    };
    return { template: newTemplate };
  },
};
