export type Room = {
  id: string;
  name: string;
  private?: boolean;
  members?: string[];
};

export type Message = {
  id: string;
  roomId: string;
  authorId: string;
  ts: string;
  text: string;
  mentions?: string[];
};
