export interface ForecastPoint {
    date: string;
    predicted: number;
    baseline: number;
    confidence_low: number;
    confidence_high: number;
    // Optional Prophet format fields
    ds?: string;
    yhat?: number;
    y?: number;
    yhat_lower?: number;
    yhat_upper?: number;
}

export interface ForecastSummary {
    avg_predicted_admissions: number;
    avg_baseline_admissions: number;
    peak_day: string;
    peak_value: number;
    explanation?: string;
    methodology?: string[];
    model_source?: string;
}

export interface ForecastMetrics {
    mae?: number;
    mape?: number;
    rmse?: number;
    r2?: number;
}

export interface FeatureImportance {
    feature: string;
    importance: number;
}

