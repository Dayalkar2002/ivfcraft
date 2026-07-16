import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { CycleEntry, RetrievalData, SourceOption } from '../../core/models';
import { CycleState } from './cycle.state';

export const CycleActions = createActionGroup({
  source: 'Cycle',
  events: {
    'Load Types': emptyProps(),
    'Load Types Success': props<{ oocyteSources: SourceOption[]; semenSources: SourceOption[] }>(),
    'Load Types Failure': props<{ error: string }>(),
    'Update Selection': props<{ oocyteSource: string; semenSource: string; cycleType: string }>(),
    'Save Entry': props<{ entry: CycleEntry }>(),
    'Save Entry Success': props<{ cycle: CycleEntry; message: string }>(),
    'Save Entry Failure': props<{ error: string }>(),
    'Load Retrieval Config': props<{ cycleId: string }>(),
    'Load Retrieval Config Success': props<{ config: CycleState['retrievalConfig'] }>(),
    'Load Retrieval Config Failure': props<{ error: string }>(),
    'Save Retrieval': props<{ cycleId: string; sections: RetrievalData }>(),
    'Save Retrieval Success': props<{ cycle: CycleEntry; message: string }>(),
    'Save Retrieval Failure': props<{ error: string }>(),
    'Clear Messages': emptyProps(),
    'Set Current Cycle': props<{ cycle: CycleEntry | null }>(),
  },
});
