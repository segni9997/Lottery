import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { 
  Campaign, Department, PaymentPlan, Registration, 
  Installment, InstallmentRequest, Winner, AuditLog 
} from '../types';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      // Fetch JWT token from localstorage if present
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Campaign', 'Department', 'PaymentPlan', 'Registration', 'Installment', 'Winner', 'AuditLog', 'Request'],
  endpoints: (builder) => ({
    // Authentication
    login: builder.mutation<{ access: string; refresh: string }, any>({
      query: (credentials) => ({
        url: '/token/',
        method: 'POST',
        body: credentials,
      }),
    }),
    
    // Campaigns
    getCampaigns: builder.query<Campaign[], { status?: string } | void>({
      query: (params) => ({
        url: '/campaigns/list/',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Campaign' as const, id })), { type: 'Campaign', id: 'LIST' }]
          : [{ type: 'Campaign', id: 'LIST' }],
    }),
    getCampaign: builder.query<Campaign, string>({
      query: (id) => `/campaigns/list/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Campaign', id }],
    }),
    createCampaign: builder.mutation<Campaign, Partial<Campaign>>({
      query: (body) => ({
        url: '/campaigns/list/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Campaign', id: 'LIST' }],
    }),
    updateCampaign: builder.mutation<Campaign, { id: string; body: Partial<Campaign> }>({
      query: ({ id, body }) => ({
        url: `/campaigns/list/${id}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Campaign', id }, { type: 'Campaign', id: 'LIST' }],
    }),
    deleteCampaign: builder.mutation<void, string>({
      query: (id) => ({
        url: `/campaigns/list/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Campaign', id: 'LIST' }],
    }),

    // Departments
    getDepartments: builder.query<Department[], { status?: string } | void>({
      query: (params) => ({
        url: '/campaigns/departments/',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Department' as const, id })), { type: 'Department', id: 'LIST' }]
          : [{ type: 'Department', id: 'LIST' }],
    }),
    createDepartment: builder.mutation<Department, Partial<Department>>({
      query: (body) => ({
        url: '/campaigns/departments/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Department', id: 'LIST' }],
    }),
    updateDepartment: builder.mutation<Department, { id: string; body: Partial<Department> }>({
      query: ({ id, body }) => ({
        url: `/campaigns/departments/${id}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Department', id }, { type: 'Department', id: 'LIST' }],
    }),
    deleteDepartment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/campaigns/departments/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Department', id: 'LIST' }],
    }),

    // Payment Plans
    getPaymentPlans: builder.query<PaymentPlan[], { is_active?: boolean } | void>({
      query: (params) => ({
        url: '/payments/plans/',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'PaymentPlan' as const, id })), { type: 'PaymentPlan', id: 'LIST' }]
          : [{ type: 'PaymentPlan', id: 'LIST' }],
    }),
    createPaymentPlan: builder.mutation<PaymentPlan, Partial<PaymentPlan>>({
      query: (body) => ({
        url: '/payments/plans/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'PaymentPlan', id: 'LIST' }],
    }),
    updatePaymentPlan: builder.mutation<PaymentPlan, { id: string; body: Partial<PaymentPlan> }>({
      query: ({ id, body }) => ({
        url: `/payments/plans/${id}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'PaymentPlan', id }, { type: 'PaymentPlan', id: 'LIST' }],
    }),

    // Registrations
    getRegistrations: builder.query<Registration[], { campaign?: string; department?: string; is_eligible?: boolean } | void>({
      query: (params) => ({
        url: '/registrations/',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Registration' as const, id })), { type: 'Registration', id: 'LIST' }]
          : [{ type: 'Registration', id: 'LIST' }],
    }),
    createRegistration: builder.mutation<Registration, Partial<Registration>>({
      query: (body) => ({
        url: '/registrations/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Registration', id: 'LIST' },
        { type: 'Campaign', id: 'LIST' }
      ],
    }),
    lookupRegistration: builder.query<Registration[], { q: string; campaign_id?: string }>({
      query: (params) => ({
        url: '/registrations/lookup/',
        params,
      }),
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: 'Registration' as const, id }))
          : [],
    }),

    // Installments
    getInstallments: builder.query<Installment[], { registration?: string; status?: string } | void>({
      query: (params) => ({
        url: '/payments/installments/',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Installment' as const, id })), { type: 'Installment', id: 'LIST' }]
          : [{ type: 'Installment', id: 'LIST' }],
    }),
    approveInstallment: builder.mutation<any, string>({
      query: (id) => ({
        url: `/payments/installments/${id}/approve/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Installment', id }, 
        { type: 'Installment', id: 'LIST' },
        { type: 'Registration', id: 'LIST' }
      ],
    }),
    markInstallmentPaid: builder.mutation<any, string>({
      query: (id) => ({
        url: `/payments/installments/${id}/mark_paid/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Installment', id },
        { type: 'Installment', id: 'LIST' }
      ],
    }),

    // Installment Requests
    getInstallmentRequests: builder.query<InstallmentRequest[], { status?: string } | void>({
      query: (params) => ({
        url: '/payments/requests/',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Request' as const, id })), { type: 'Request', id: 'LIST' }]
          : [{ type: 'Request', id: 'LIST' }],
    }),
    requestNextInstallment: builder.mutation<InstallmentRequest, { installment: string }>({
      query: (body) => ({
        url: '/payments/requests/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Request', id: 'LIST' },
        { type: 'Installment', id: 'LIST' }
      ],
    }),
    approveInstallmentRequest: builder.mutation<any, { id: string; admin_notes?: string }>({
      query: ({ id, admin_notes }) => ({
        url: `/payments/requests/${id}/approve_request/`,
        method: 'POST',
        body: { admin_notes },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Request', id },
        { type: 'Request', id: 'LIST' },
        { type: 'Installment', id: 'LIST' }
      ],
    }),
    rejectInstallmentRequest: builder.mutation<any, { id: string; admin_notes?: string }>({
      query: ({ id, admin_notes }) => ({
        url: `/payments/requests/${id}/reject_request/`,
        method: 'POST',
        body: { admin_notes },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Request', id },
        { type: 'Request', id: 'LIST' },
        { type: 'Installment', id: 'LIST' }
      ],
    }),

    // Draws
    getWinners: builder.query<Winner[], { campaign?: string } | void>({
      query: (params) => ({
        url: '/draws/winners/',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Winner' as const, id })), { type: 'Winner', id: 'LIST' }]
          : [{ type: 'Winner', id: 'LIST' }],
    }),
    drawWinner: builder.mutation<Winner, { campaign_id: string; rank: number; prize_description?: string }>({
      query: (body) => ({
        url: '/draws/winners/draw/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Winner', id: 'LIST' }, 
        { type: 'Campaign', id: 'LIST' },
        { type: 'Registration', id: 'LIST' },
        { type: 'AuditLog', id: 'LIST' }
      ],
    }),
    getAuditLogs: builder.query<AuditLog[], { action?: string } | void>({
      query: (params) => ({
        url: '/draws/logs/',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'AuditLog' as const, id })), { type: 'AuditLog', id: 'LIST' }]
          : [{ type: 'AuditLog', id: 'LIST' }],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetCampaignsQuery,
  useGetCampaignQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  
  useGetPaymentPlansQuery,
  useCreatePaymentPlanMutation,
  useUpdatePaymentPlanMutation,
  
  useGetRegistrationsQuery,
  useCreateRegistrationMutation,
  useLookupRegistrationQuery,
  useLazyLookupRegistrationQuery,
  
  useGetInstallmentsQuery,
  useApproveInstallmentMutation,
  useMarkInstallmentPaidMutation,
  
  useGetInstallmentRequestsQuery,
  useRequestNextInstallmentMutation,
  useApproveInstallmentRequestMutation,
  useRejectInstallmentRequestMutation,
  
  useGetWinnersQuery,
  useDrawWinnerMutation,
  useGetAuditLogsQuery,
} = apiSlice;
