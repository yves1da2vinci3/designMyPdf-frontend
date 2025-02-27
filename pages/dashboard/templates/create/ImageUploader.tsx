import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Group,
  Text,
  Stack,
  Textarea,
  Image,
  SimpleGrid,
  ActionIcon,
  Loader,
  Center,
} from '@mantine/core';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { IconUpload, IconPhoto, IconX, IconTrash } from '@tabler/icons-react';
import notificationService from '@/services/NotificationService';

interface ImageUploaderProps {
  onGenerate: (content: string, variables: any) => void;
  onClose: () => void;
}

function ImageUploader({ onGenerate, onClose }: ImageUploaderProps) {
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const openRef = useRef<() => void>(null);

  const handleDrop = (acceptedFiles: FileWithPath[]) => {
    // Limit to 5 files
    const newFiles = [...files, ...acceptedFiles].slice(0, 5);
    setFiles(newFiles);
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.urls && Array.isArray(data.urls)) {
        setUploadedUrls(data.urls);
        setFiles([]);
        notificationService.showSuccessNotification('Images uploaded successfully');
      } else {
        throw new Error('Failed to upload images');
      }
    } catch (error: any) {
      notificationService.showErrorNotification(error?.message || 'Error uploading images');
    } finally {
      setIsUploading(false);
    }
  };

  const generateTemplate = async () => {
    if (uploadedUrls.length === 0 || !prompt) {
      notificationService.showErrorNotification('Please upload images and provide a prompt');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-template-from-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          imageUrls: uploadedUrls,
        }),
      });

      // Check if the response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to generate template';

        try {
          // Try to parse the error as JSON
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.details || errorMessage;
        } catch (parseError) {
          // If parsing fails, use the raw text
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.content) {
        onGenerate(data.content, data.suggestedVariables || {});
        onClose();
      } else {
        throw new Error('Failed to generate template');
      }
    } catch (error: any) {
      console.error('Error generating template:', error);
      notificationService.showErrorNotification(error?.message || 'Error generating template');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAll = () => {
    setFiles([]);
    setUploadedUrls([]);
    setPrompt('');
  };

  return (
    <Stack gap="xl">
      <Text size="sm" c="dimmed">
        Upload images and provide a prompt to generate a template. The AI will analyze the images
        and create a template based on your requirements.
      </Text>

      {uploadedUrls.length > 0 ? (
        <>
          <Box>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>
                Uploaded Images
              </Text>
              <Button
                variant="subtle"
                color="red"
                size="xs"
                leftSection={<IconTrash size={14} />}
                onClick={() => setUploadedUrls([])}
              >
                Clear All
              </Button>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xs">
              {uploadedUrls.map((url, index) => (
                <Box key={index} pos="relative">
                  <ActionIcon
                    color="red"
                    variant="filled"
                    radius="xl"
                    size="sm"
                    style={{ position: 'absolute', top: 5, right: 5, zIndex: 10 }}
                    onClick={() => setUploadedUrls((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                  <Image
                    src={url}
                    height={120}
                    fit="cover"
                    radius="md"
                    style={{ border: '1px solid #373A40' }}
                  />
                </Box>
              ))}
            </SimpleGrid>
          </Box>

          <Textarea
            label="Template Description"
            description="Describe what kind of template you want to generate based on these images"
            placeholder={
              'Create a modern invoice template inspired by these images with a clean header, ' +
              'company details section, itemized table with calculations, and a professional footer...'
            }
            minRows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            styles={{
              root: {
                '& label': {
                  color: 'white',
                  marginBottom: '0.5rem',
                },
                '& .mantine-Textarea-description': {
                  color: '#909296',
                },
              },
              input: {
                backgroundColor: '#25262B',
                color: 'white',
                border: '1px solid #373A40',
                transition: 'all 0.2s ease',
                '&:focus': {
                  borderColor: '#3B82F6',
                  boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
                },
              },
            }}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={clearAll} disabled={isGenerating}>
              Clear All
            </Button>
            <Button
              onClick={generateTemplate}
              loading={isGenerating}
              disabled={!prompt}
              color="blue"
            >
              Generate Template
            </Button>
          </Group>
        </>
      ) : (
        <>
          <Dropzone
            onDrop={handleDrop}
            accept={['image/png', 'image/jpeg', 'image/gif', 'image/webp']}
            maxSize={5 * 1024 * 1024}
            maxFiles={5}
            openRef={openRef}
            styles={{
              root: {
                borderColor: '#373A40',
                backgroundColor: '#25262B',
                '&:hover': {
                  borderColor: '#3B82F6',
                },
              },
            }}
          >
            <Group justify="center" gap="xl" style={{ minHeight: 140, pointerEvents: 'none' }}>
              <Dropzone.Accept>
                <IconUpload size={50} stroke={1.5} color="#3B82F6" />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX size={50} stroke={1.5} color="#ff0000" />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconPhoto size={50} stroke={1.5} color="#909296" />
              </Dropzone.Idle>

              <Stack gap="xs" style={{ textAlign: 'center' }}>
                <Text size="xl" inline c="white">
                  Drag images here or click to select files
                </Text>
                <Text size="sm" c="dimmed" inline>
                  Upload up to 5 images, each file should not exceed 5MB
                </Text>
              </Stack>
            </Group>
          </Dropzone>

          {files.length > 0 && (
            <Box>
              <Text size="sm" fw={500} mb="xs">
                Selected Images
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xs">
                {files.map((file, index) => (
                  <Box key={index} pos="relative">
                    <ActionIcon
                      color="red"
                      variant="filled"
                      radius="xl"
                      size="sm"
                      style={{ position: 'absolute', top: 5, right: 5, zIndex: 10 }}
                      onClick={() => removeFile(index)}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                    <Image
                      src={URL.createObjectURL(file)}
                      height={120}
                      fit="cover"
                      radius="md"
                      style={{ border: '1px solid #373A40' }}
                      onLoad={() => URL.revokeObjectURL(URL.createObjectURL(file))}
                    />
                  </Box>
                ))}
              </SimpleGrid>

              <Group justify="flex-end" mt="md">
                <Button variant="subtle" color="gray" onClick={() => setFiles([])}>
                  Clear
                </Button>
                <Button
                  onClick={uploadFiles}
                  loading={isUploading}
                  leftSection={<IconUpload size={16} />}
                  color="blue"
                >
                  Upload
                </Button>
              </Group>
            </Box>
          )}
        </>
      )}

      {(isUploading || isGenerating) && (
        <Center
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 100,
          }}
        >
          <Stack align="center">
            <Loader size="lg" color="blue" />
            <Text c="white">{isUploading ? 'Uploading images...' : 'Generating template...'}</Text>
          </Stack>
        </Center>
      )}
    </Stack>
  );
}

export default ImageUploader;
