import { LiveStatus } from '../entities/live-event.entity';

// Create -> Update로 변경
export interface UpdateLiveEventDto {
  title?: string;
  status?: LiveStatus;
  productIds?: string[];
}
