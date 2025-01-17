
'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useForm } from 'react-hook-form';
import CustomFormField, { FormFieldType } from '@/components/Form Reusables/CustomFormField';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import Loader from "@/components/Common/Loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { projectManagementServices } from '@/services/projectManagementServices';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

interface ModuleData {
  moduleName: string;
  description: string;
  deadline: Date;
  status: 'todo' | 'inprogress' | 'completed';
}

interface ProjectData {
  _id: string;
  projectName: string;
  projectDescription: string;
  budget: {
    amount: number;
    currency: string;
  };
  projectStatus: 'PENDING' | 'CANCELLED' | 'ACTIVE' | 'COMPLETED' | 'INACTIVE';
  approvedByFinance: boolean;
  sendForApproval: boolean;
  modules: ModuleData[];
}

const projectStatuses = ['PENDING', 'CANCELLED', 'ACTIVE', 'COMPLETED', 'INACTIVE'];

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);

  const currencies = ['USD', 'PKR'];

  const form = useForm<ProjectData>({
    defaultValues: {
      projectName: '',
      projectDescription: '',
      budget: {
        amount: 0,
        currency: 'USD'
      },
      modules: [],
      projectStatus: 'PENDING',
      approvedByFinance: false,
      sendForApproval: false
    }
  });

  // Add new module function

  const handleAddModule = async () => {
    try {
      const currentModules = form.getValues('modules');
      const newModule = {
        moduleName: '',
        description: '',
        deadline: new Date(),
        status: 'todo' as const
      };

      const updatedModules = [...currentModules, newModule];

      // Update form state and save to database
      form.setValue('modules', updatedModules);
      const currentData = form.getValues();
      const updatedProject = {
        ...currentData,
        modules: updatedModules
      };

      const result = await projectManagementServices.updateProject(
        params.id as string,
        updatedProject
      );

      if (!result.success) {
        throw new Error(result.message || 'Failed to add module');
      }

      toast.success('Module added successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add module';
      console.error('Error adding module:', error);
      toast.error(errorMessage);
    }
  };

  // Remove module function

  const handleRemoveModule = async (indexToRemove: number) => {
    try {
      const currentModules = form.getValues('modules');
      const updatedModules = currentModules.filter((_, index) => index !== indexToRemove);

      // Update form state and save to database
      form.setValue('modules', updatedModules);
      const currentData = form.getValues();
      const updatedProject = {
        ...currentData,
        modules: updatedModules
      };

      const result = await projectManagementServices.updateProject(
        params.id as string,
        updatedProject
      );

      if (!result.success) {
        throw new Error(result.message || 'Failed to remove module');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove module';
      console.error('Error removing module:', error);
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    const fetchProject = async () => {
      const projectId = params.id as string;

      if (projectId) {
        try {
          const result = await projectManagementServices.getProject(projectId);

          if (result.success && result.data) {
            const project = result.data;
            const transformedProject: ProjectData = {
              ...project,
              modules: project.modules.map((module: ModuleData) => ({
                ...module,
                deadline: new Date(module.deadline)
              }))
            };

            setProjectData(transformedProject);
            form.reset(transformedProject);
          } else {
            toast.error('Project not found');
            router.push('/manage-projects');
          }
        } catch (error) {
          console.error('Error fetching project:', error);
          toast.error('Failed to load project details');
          router.push('/manage-projects');
        } finally {
          setIsPageLoading(false);
        }
      }
    };

    fetchProject();
  }, [params.id, form, router]);

  const onSubmit = async (data: ProjectData) => {
    try {
      setLoading(true);

      const updatedProject = {
        projectName: data.projectName,
        projectDescription: data.projectDescription,
        budget: {
          amount: data.budget.amount,
          currency: data.budget.currency
        },
        projectStatus: data.projectStatus,
        sendForApproval: data.sendForApproval,
        approvedByFinance: (data.sendForApproval && data.approvedByFinance) && false,
        modules: data.modules.map(module => ({
          moduleName: module.moduleName,
          description: module.description,
          deadline: new Date(module.deadline),
          status: module.status
        }))
      };

      const result = await projectManagementServices.updateProject(
        params.id as string,
        updatedProject
      );

      if (result.success) {
        toast.success('Project updated successfully');
        router.push('/manage-projects');
      } else {
        throw new Error(result.message || 'Failed to update project');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update project';
      console.error('Error updating project:', error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {isPageLoading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">Edit Project</h1>
          </CardHeader>
          <CardContent>
            {projectData ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    control={form.control}
                    name="projectName"
                    label="Project Name"
                    placeholder="Enter project name"
                  />

                  <CustomFormField
                    fieldType={FormFieldType.TEXTAREA}
                    control={form.control}
                    name="projectDescription"
                    label="Project Description"
                    placeholder="Enter project description"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <CustomFormField
                        fieldType={FormFieldType.NUMBER}
                        control={form.control}
                        name="budget.amount"
                        label="Project Budget Amount"
                        placeholder="Enter budget amount"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Currency
                      </label>
                      <Select
                        value={form.watch('budget.currency')}
                        onValueChange={(value) => form.setValue('budget.currency', value)}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Project Status
                      </label>
                      <Select
                        value={form.watch('projectStatus')}
                        onValueChange={(value) => form.setValue('projectStatus', value as any)}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {projectStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CustomFormField
                          fieldType={FormFieldType.CHECKBOX}
                          control={form.control}
                          name="sendForApproval"
                          label="Send(Resend) To Finance For Price Approval"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="font-semibold">Modules</h2>
                      <Button
                        type="button"
                        onClick={handleAddModule}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Module
                      </Button>
                    </div>

                    {form.watch('modules')?.map((module, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3 relative">
                        <Button
                          type="button"
                          onClick={() => handleRemoveModule(index)}
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        <CustomFormField
                          fieldType={FormFieldType.INPUT}
                          control={form.control}
                          name={`modules.${index}.moduleName`}
                          label="Module Name"
                          placeholder="Enter module name"
                        />

                        <CustomFormField
                          fieldType={FormFieldType.TEXTAREA}
                          control={form.control}
                          name={`modules.${index}.description`}
                          label="Module Description"
                          placeholder="Enter module description"
                        />

                        <CustomFormField
                          fieldType={FormFieldType.DATE}
                          control={form.control}
                          name={`modules.${index}.deadline`}
                          label="Deadline"
                        />

                        <div>
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Status
                          </label>
                          <Select
                            value={form.watch(`modules.${index}.status`)}
                            onValueChange={(value) => form.setValue(`modules.${index}.status`, value as any)}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="todo">To Do</SelectItem>
                              <SelectItem value="inprogress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="flex justify-center items-center min-h-[40vh]">
                <Loader />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}