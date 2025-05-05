export type ChatMessage = {
  sender: "USER" | "AI";
  message: string;
};

export type ChatStore = {
  chatLog: ChatMessage[];
  addUserMessage: (message: string) => void;
};

export interface CompanyState {
  companyId: number;
  companyName: string;
  companySize: string;
  companyLocation: string;
}

export interface SelectCompanyState {
  company: CompanyState;

  setSelectCompany: (company: CompanyState) => void;
}
