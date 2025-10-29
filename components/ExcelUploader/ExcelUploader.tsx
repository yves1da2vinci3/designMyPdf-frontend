import React, { useState } from 'react';
import { Modal, Button, Group, Text, Select } from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import * as XLSX from 'xlsx';

interface ExcelUploaderProps {
  opened: boolean;
  onClose: () => void;
  onUpload: (data: any[]) => void;
  templates: any[];
  setSelectedTemplate: (template: any) => void;
}

export function ExcelUploader({
  opened,
  onClose,
  onUpload,
  templates,
  setSelectedTemplate,
}: ExcelUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);

  const handleDrop = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  };

  const handleUpload = () => {
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          const data = new Uint8Array(event.target.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          onUpload(json);
          setFiles([]);
          onClose();
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Upload Excel File">
      <Select
        label="Select a template"
        placeholder="Pick one"
        data={templates.map((template: any) => ({ value: template.ID, label: template.name }))}
        onChange={(value) => {
          const selected = templates.find((template: any) => template.ID === value);
          setSelectedTemplate(selected);
        }}
        mb="md"
      />
      <Dropzone
        onDrop={handleDrop}
        accept={[MIME_TYPES.xlsx]}
        maxSize={10 * 1024 ** 2}
        multiple={false}
      >
        <Group justify="center" gap="xl" style={{ minHeight: 220, pointerEvents: 'none' }}>
          <Text size="xl" inline>
            Drag your .xlsx file here or click to select a file
          </Text>
        </Group>
      </Dropzone>
      {files.length > 0 && <Text mt="md">Selected file: {files[0].name}</Text>}
      <Group justify="flex-end" mt="md">
        <Button onClick={handleUpload} disabled={files.length === 0}>
          Upload
        </Button>
      </Group>
    </Modal>
  );
}
