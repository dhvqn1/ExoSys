import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { CatalogPlanet, CatalogSummary, GeneratePlanetRequest, GeneratedPlanet, HabitabilityRequest, HabitabilityResponse, HealthStatus, PredictRequest, PredictResponse, TimelineEntry } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * Returns server health status
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Classify a candidate signal as a confirmed exoplanet (1) or false positive (0) using a gradient boosted classifier trained on Kepler-style features.
 * @summary Predict exoplanet candidate
 */
export declare const getPredictExoplanetUrl: () => string;
export declare const predictExoplanet: (predictRequest: PredictRequest, options?: RequestInit) => Promise<PredictResponse>;
export declare const getPredictExoplanetMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof predictExoplanet>>, TError, {
        data: BodyType<PredictRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof predictExoplanet>>, TError, {
    data: BodyType<PredictRequest>;
}, TContext>;
export type PredictExoplanetMutationResult = NonNullable<Awaited<ReturnType<typeof predictExoplanet>>>;
export type PredictExoplanetMutationBody = BodyType<PredictRequest>;
export type PredictExoplanetMutationError = ErrorType<unknown>;
/**
 * @summary Predict exoplanet candidate
 */
export declare const usePredictExoplanet: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof predictExoplanet>>, TError, {
        data: BodyType<PredictRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof predictExoplanet>>, TError, {
    data: BodyType<PredictRequest>;
}, TContext>;
/**
 * @summary List the curated catalog of confirmed exoplanets used in the 3D scene
 */
export declare const getListCatalogPlanetsUrl: () => string;
export declare const listCatalogPlanets: (options?: RequestInit) => Promise<CatalogPlanet[]>;
export declare const getListCatalogPlanetsQueryKey: () => readonly ["/api/catalog/planets"];
export declare const getListCatalogPlanetsQueryOptions: <TData = Awaited<ReturnType<typeof listCatalogPlanets>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCatalogPlanets>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCatalogPlanets>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCatalogPlanetsQueryResult = NonNullable<Awaited<ReturnType<typeof listCatalogPlanets>>>;
export type ListCatalogPlanetsQueryError = ErrorType<unknown>;
/**
 * @summary List the curated catalog of confirmed exoplanets used in the 3D scene
 */
export declare function useListCatalogPlanets<TData = Awaited<ReturnType<typeof listCatalogPlanets>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCatalogPlanets>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Yearly discovery counts of confirmed exoplanets.
 * @summary Discovery timeline
 */
export declare const getGetDiscoveryTimelineUrl: () => string;
export declare const getDiscoveryTimeline: (options?: RequestInit) => Promise<TimelineEntry[]>;
export declare const getGetDiscoveryTimelineQueryKey: () => readonly ["/api/catalog/timeline"];
export declare const getGetDiscoveryTimelineQueryOptions: <TData = Awaited<ReturnType<typeof getDiscoveryTimeline>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDiscoveryTimeline>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDiscoveryTimeline>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDiscoveryTimelineQueryResult = NonNullable<Awaited<ReturnType<typeof getDiscoveryTimeline>>>;
export type GetDiscoveryTimelineQueryError = ErrorType<unknown>;
/**
 * @summary Discovery timeline
 */
export declare function useGetDiscoveryTimeline<TData = Awaited<ReturnType<typeof getDiscoveryTimeline>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDiscoveryTimeline>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Aggregate stats over the catalog
 */
export declare const getGetCatalogSummaryUrl: () => string;
export declare const getCatalogSummary: (options?: RequestInit) => Promise<CatalogSummary>;
export declare const getGetCatalogSummaryQueryKey: () => readonly ["/api/catalog/summary"];
export declare const getGetCatalogSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getCatalogSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCatalogSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCatalogSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCatalogSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getCatalogSummary>>>;
export type GetCatalogSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Aggregate stats over the catalog
 */
export declare function useGetCatalogSummary<TData = Awaited<ReturnType<typeof getCatalogSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCatalogSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Procedurally generate an exoplanet
 */
export declare const getGeneratePlanetUrl: () => string;
export declare const generatePlanet: (generatePlanetRequest: GeneratePlanetRequest, options?: RequestInit) => Promise<GeneratedPlanet>;
export declare const getGeneratePlanetMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof generatePlanet>>, TError, {
        data: BodyType<GeneratePlanetRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof generatePlanet>>, TError, {
    data: BodyType<GeneratePlanetRequest>;
}, TContext>;
export type GeneratePlanetMutationResult = NonNullable<Awaited<ReturnType<typeof generatePlanet>>>;
export type GeneratePlanetMutationBody = BodyType<GeneratePlanetRequest>;
export type GeneratePlanetMutationError = ErrorType<unknown>;
/**
 * @summary Procedurally generate an exoplanet
 */
export declare const useGeneratePlanet: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof generatePlanet>>, TError, {
        data: BodyType<GeneratePlanetRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof generatePlanet>>, TError, {
    data: BodyType<GeneratePlanetRequest>;
}, TContext>;
/**
 * @summary Simulate habitability of a planet given star + orbit + atmosphere parameters
 */
export declare const getSimulateHabitabilityUrl: () => string;
export declare const simulateHabitability: (habitabilityRequest: HabitabilityRequest, options?: RequestInit) => Promise<HabitabilityResponse>;
export declare const getSimulateHabitabilityMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof simulateHabitability>>, TError, {
        data: BodyType<HabitabilityRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof simulateHabitability>>, TError, {
    data: BodyType<HabitabilityRequest>;
}, TContext>;
export type SimulateHabitabilityMutationResult = NonNullable<Awaited<ReturnType<typeof simulateHabitability>>>;
export type SimulateHabitabilityMutationBody = BodyType<HabitabilityRequest>;
export type SimulateHabitabilityMutationError = ErrorType<unknown>;
/**
 * @summary Simulate habitability of a planet given star + orbit + atmosphere parameters
 */
export declare const useSimulateHabitability: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof simulateHabitability>>, TError, {
        data: BodyType<HabitabilityRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof simulateHabitability>>, TError, {
    data: BodyType<HabitabilityRequest>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map