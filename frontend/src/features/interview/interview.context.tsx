import React, { createContext, useState, ReactNode } from "react";

export interface InterviewContextType {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  report: any | null;
  setReport: React.Dispatch<React.SetStateAction<any | null>>;
  reports: any[];
  setReports: React.Dispatch<React.SetStateAction<any[]>>;
}

export const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

interface InterviewProviderProps {
  children: ReactNode;
}

export const InterviewProvider: React.FC<InterviewProviderProps> = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<any | null>(null);
    const [reports, setReports] = useState<any[]>([]);

    return (
        <InterviewContext.Provider value={{ loading, setLoading, report, setReport, reports, setReports }}>
            {children}
        </InterviewContext.Provider>
    );
};
