// Topic/Group related types

export interface CreateTopicRequest {
  name: string;
  description?: string;
}

export interface UpdateTopicRequest {
  name?: string;
}

export interface Topic {
  _id: string;
  key: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

// Database response for notification groups
export interface NotificationGroup {
  id: number;
  name: string;
  description?: string;
  novu_topic_key: string;
  user_id?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface TopicResponse {
  message: string;
  data: Topic;
}

export interface ListTopicsResponse {
  status: string;
  message: string;
  data: {
    data: NotificationGroup[];
    totalCount: number;
  };
}

export interface DeleteTopicResponse {
  message: string;
}

