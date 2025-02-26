export type AIMessage = {
  role: 'user' | 'model';
  parts: [{ text: string }];
};
