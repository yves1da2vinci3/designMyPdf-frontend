import { cssframeworkTypes } from "@/utils/enums";

export interface CreateTemplateDto {
    name: string;
    cssframework: cssframeworkTypes;
  }


  export const templateApi = {
    createTemplate: (template: CreateTemplateDto) => {}
  }