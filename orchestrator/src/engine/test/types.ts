export interface Welcome {
  ProjectMasterId: string;
  nodes: Node[];
  edges: Edge[];
}

export interface Edge {
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
  animated: boolean;
  markerEnd: MarkerEnd;
  type: string;
  id: string;
}

export interface MarkerEnd {
  type: string;
  color: string;
}

export interface Node {
  id: string;
  type: string;
  data: Data;
  position: Position;
  width: number;
  height: number;
  selected?: boolean;
  positionAbsolute?: Position;
  dragging?: boolean;
}

export interface Data {
  label?: string;
  conditions?: any[];
  timer?: number;
  seqNo?: string;
  enabled?: boolean;
  id?: string;
  type?: number;
  title?: string;
  given?: string;
  when?: string;
  then?: string;
  execSteps?: DataExecSteps;
  settings?: DataSettings | null;
  tags?: string[];
  updatedBy?: null | string;
  AccountId?: string;
  TestScenarioId?: string;
  TenantId?: null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: null;
  status?: boolean;
  name?: string;
  description?: string;
  remark?: any[];
  ProjectMasterId?: string;
  TestCases?: TestCase[];
}

export interface TestCase {
  label: string;
  seqNo: string;
  enabled: boolean;
  id: string;
  type: number;
  title: string;
  given: string;
  when: string;
  then: string;
  execSteps: TestCaseExecSteps;
  settings: TestCaseSettings;
  tags: string[];
  updatedBy: string;
  AccountId: string;
  TestScenarioId: string;
  TenantId: null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: null;
}

export interface TestCaseExecSteps {
  statusCode: number;
  condition: string;
  reqBody?: string;
}

export interface TestCaseSettings {
  sleep: Sleep;
  method: string;
  host: string;
  path: string;
  header: PurpleHeader[];
}

export interface PurpleHeader {
  key: Key;
  value: Value;
  description: Description;
}

export enum Description {
  AccessToken = "Access Token",
  ClientAgent = "Client Agent"
}

export enum Key {
  Authorization = "authorization",
  ClientAgent = "client-agent"
}

export enum Value {
  BearerJWTTOKEN = "Bearer ${JWT_TOKEN}",
  RrDataPortal = "rr-data-portal"
}

export interface Sleep {
  interval: number;
  timeType: number;
}

export interface DataExecSteps {
  reqBody?: string;
  reqbody?: string;
  resBody: string;
  condition: string;
  statusCode: number;
}

export interface DataSettings {
  host: string;
  path: string;
  sleep: Sleep;
  header: FluffyHeader[];
  method: string;
  timeout: number;
}

export interface FluffyHeader {
  key: Key;
  value: Value;
}

export interface Position {
  x: number;
  y: number;
}
