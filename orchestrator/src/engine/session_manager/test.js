const JSONToJobTree = require("./job_tree");

const json = {
  nodes: [
    {
      id: "start",
      type: "START_TASK",
      data: {
        label: "Start"
      },
      position: {
        x: 50,
        y: 300
      },
      width: 77,
      height: 76
    },
    {
      id: "ilOVa0MpUP",
      type: "SCENARIO_TASK",
      data: {
        status: true,
        id: "5c419899-d709-4626-a6cc-37553bbd07bb",
        name: "API TEST Workflow",
        description: "REST API Test cases\n",
        remark: [],
        settings: {
          env: [
            {
              key: "DATA_PORTAL",
              value: "https://data-portal.dataplatform-np.rr-it.com"
            },
            {
              key: "OKTA_USERNAME",
              value: "ykrishnaraju"
            },
            {
              key: "RELEASE_VERSION",
              value: "1"
            },
            {
              key: "API_URL",
              value: "https://enrich-data-portal-dev.nonprod.dna.rr-it.com"
            },
            {
              key: "JWT_TOKEN",
              value:
                "eyJraWQiOiIyNnFhcnpqSVlUal9YdXVPSlh5VzhWemZrdkFPbkVjN3lkUlNPaUlKM0hZIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULldHT08tR0VNX0RSbDA5VUVZcXVPUFhVcjBrNVNMOVFHV2pZTThWSHJwRXMiLCJpc3MiOiJodHRwczovL2ViYXRlcy5va3RhLmNvbS9vYXV0aDIvZGVmYXVsdCIsImF1ZCI6ImFwaTovL2RlZmF1bHQiLCJpYXQiOjE3MjczMzkxMTYsImV4cCI6MTcyNzM0MjcxNiwiY2lkIjoiMG9hMXI0Yzc2bjFaNUhHUHYwaDgiLCJ1aWQiOiIwMHUxdzgxeW95NUZMN1U4WDBoOCIsInNjcCI6WyJvcGVuaWQiLCJlbWFpbCIsInByb2ZpbGUiXSwiYXV0aF90aW1lIjoxNzI3MTk3MDQwLCJzdWIiOiJ5a3Jpc2huYXJhanVAZWJhdGVzLmNvbSJ9.tifl8meQSKpjscX4ZfgnF3gD8emJBWk2m1M7ndzJvEDPoWCggR_DvX1Q1h0vIt81GIWe2RP4yrqyMhH_igxGgPQISCG0a3fGeNmUWfj6nwBgSI-ut32Vus6vd_SFmG0K1nK40wZaTEIVmhuBFM__Y2I32sSmjW2wc-L6fRsbvOnSz8zckeLf6h6RRRbLOHNBmCmQ4FBty-nJjTjXlp9VZ2L-A_B17NM_vppNWV2spLvpu2NlvDx9MChwEh2NXOHh8b1Z3d9r7Wifqbtd7UVNnM_aNiZn71s0wdqpoti-r7w3hB6qoyEPfpovKh8dgeUx3FW9I-hJWq74t89_-oBS2A"
            },
            {
              key: "OKTA_PASSWORD",
              value: "NanNandu@143"
            }
          ],
          edges: [
            {
              id: "reactflow__edge-startstart-node-5tRLDGzilatarget:5tRLDGzila",
              type: "default",
              source: "start",
              target: "5tRLDGzila",
              animated: true,
              markerEnd: {
                type: "arrowclosed",
                color: "rgb(148 163 184)"
              },
              sourceHandle: "start-node",
              targetHandle: "target:5tRLDGzila"
            },
            {
              id: "reactflow__edge-5tRLDGzilasource:5tRLDGzila-PQM9v4qyN9target:CASE_TASK",
              type: "default",
              source: "5tRLDGzila",
              target: "PQM9v4qyN9",
              animated: true,
              markerEnd: {
                type: "arrowclosed",
                color: "rgb(148 163 184)"
              },
              sourceHandle: "source:5tRLDGzila",
              targetHandle: "target:CASE_TASK"
            },
            {
              id: "reactflow__edge-PQM9v4qyN9source:CASE_TASK-A6AjnC1ORdtarget:CASE_TASK",
              type: "default",
              source: "PQM9v4qyN9",
              target: "A6AjnC1ORd",
              animated: true,
              markerEnd: {
                type: "arrowclosed",
                color: "rgb(148 163 184)"
              },
              sourceHandle: "source:CASE_TASK",
              targetHandle: "target:CASE_TASK"
            },
            {
              id: "reactflow__edge-A6AjnC1ORdsource:CASE_TASK-g9ke-y8Eeztarget:CASE_TASK",
              type: "default",
              source: "A6AjnC1ORd",
              target: "g9ke-y8Eez",
              animated: true,
              markerEnd: {
                type: "arrowclosed",
                color: "rgb(148 163 184)"
              },
              sourceHandle: "source:CASE_TASK",
              targetHandle: "target:CASE_TASK"
            },
            {
              id: "reactflow__edge-A6AjnC1ORdsource:CASE_TASK-eKteYKxm8Ktarget:CASE_TASK",
              type: "default",
              source: "A6AjnC1ORd",
              target: "eKteYKxm8K",
              animated: true,
              markerEnd: {
                type: "arrowclosed",
                color: "rgb(148 163 184)"
              },
              sourceHandle: "source:CASE_TASK",
              targetHandle: "target:CASE_TASK"
            },
            {
              id: "reactflow__edge-A6AjnC1ORdsource:CASE_TASK-ieGc8n6H6otarget:CASE_TASK",
              type: "default",
              source: "A6AjnC1ORd",
              target: "ieGc8n6H6o",
              animated: true,
              markerEnd: {
                type: "arrowclosed",
                color: "rgb(148 163 184)"
              },
              sourceHandle: "source:CASE_TASK",
              targetHandle: "target:CASE_TASK"
            },
            {
              id: "reactflow__edge-g9ke-y8Eezsource:CASE_TASK-a21Tt9LUt3target:CASE_TASK",
              type: "default",
              source: "g9ke-y8Eez",
              target: "a21Tt9LUt3",
              animated: true,
              markerEnd: {
                type: "arrowclosed",
                color: "rgb(148 163 184)"
              },
              sourceHandle: "source:CASE_TASK",
              targetHandle: "target:CASE_TASK"
            },
            {
              id: "reactflow__edge-eKteYKxm8Ksource:CASE_TASK--DYRxpMgaZtarget:CASE_TASK",
              type: "default",
              source: "eKteYKxm8K",
              target: "-DYRxpMgaZ",
              animated: true,
              markerEnd: {
                type: "arrowclosed",
                color: "rgb(148 163 184)"
              },
              sourceHandle: "source:CASE_TASK",
              targetHandle: "target:CASE_TASK"
            },
            {
              id: "reactflow__edge-a21Tt9LUt3source:CASE_TASK--DYRxpMgaZtarget:CASE_TASK",
              type: "default",
              source: "a21Tt9LUt3",
              target: "-DYRxpMgaZ",
              animated: true,
              markerEnd: {
                type: "arrowclosed",
                color: "rgb(148 163 184)"
              },
              sourceHandle: "source:CASE_TASK",
              targetHandle: "target:CASE_TASK"
            },
            {
              id: "reactflow__edge-ieGc8n6H6osource:CASE_TASK--DYRxpMgaZtarget:CASE_TASK",
              type: "default",
              source: "ieGc8n6H6o",
              target: "-DYRxpMgaZ",
              animated: true,
              markerEnd: {
                type: "arrowclosed",
                color: "rgb(148 163 184)"
              },
              sourceHandle: "source:CASE_TASK",
              targetHandle: "target:CASE_TASK"
            }
          ],
          nodes: [
            {
              id: "start",
              data: {
                label: "Start"
              },
              type: "START_TASK",
              width: 70,
              height: 70,
              dragging: true,
              position: {
                x: 411.2104776904235,
                y: 279.7072765342459
              },
              selected: false,
              positionAbsolute: {
                x: 411.2104776904235,
                y: 279.7072765342459
              }
            },
            {
              id: "5tRLDGzila",
              data: {
                label: "Timer Event",
                timer: 0
              },
              type: "TIMER_TASK",
              width: 56,
              height: 40,
              dragging: true,
              position: {
                x: 560.1359672093258,
                y: 298.64626685824317
              },
              selected: true,
              positionAbsolute: {
                x: 560.1359672093258,
                y: 298.64626685824317
              }
            },
            {
              id: "PQM9v4qyN9",
              data: {
                id: "6fd09294-0157-4d2e-b8cc-4cce520afdfb",
                tags: ["OktaLogin"],
                then: "User should be able login successfully and view the list apps",
                type: 2,
                when: "User login through okta app",
                given:
                  "User having valid credentials for ebates.okta.com, user is connected through VPN, user can now open the data portal URL in any latest browser.",
                label: "TCID0001",
                seqNo: "0001",
                enabled: true,
                settings: {
                  sleep: {
                    timeType: 0
                  },
                  screenshot: 0
                },
                AccountId: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
                createdAt: "2024-07-13 18:53:35",
                deletedAt: null,
                execSteps: [
                  {
                    data: {
                      by: "xpath",
                      value: "${DATA_PORTAL}",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "navigateToURL"
                  },
                  {
                    data: {
                      by: "id",
                      value: "${OKTA_USERNAME}",
                      element: "okta-signin-username"
                    },
                    enabled: true,
                    actionType: "setText"
                  },
                  {
                    data: {
                      by: "id",
                      value: "${OKTA_PASSWORD}",
                      element: "okta-signin-password"
                    },
                    enabled: true,
                    actionType: "setText"
                  },
                  {
                    data: {
                      by: "id",
                      element: "okta-signin-submit"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "delay"
                  },
                  {
                    data: {
                      by: "xpath",
                      element: "/html/body/div[2]/div/main/div[2]/div/div/form[1]/div[2]/input"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "delay"
                  },
                  {
                    data: {
                      by: "id",
                      element: "enrich_flow"
                    },
                    enabled: true,
                    actionType: "verifyElementVisible"
                  }
                ],
                updatedAt: "2024-08-06 02:14:22",
                conditions: [
                  {
                    fallback: "b2aa8ec0-fc91-4e4c-a000-64c04655d64f",
                    isActive: true,
                    statement: [
                      {
                        rightOp: "2",
                        operator: "eq"
                      }
                    ]
                  }
                ],
                TestScenarioId: "8454c283-7a19-4045-9d5a-e9120e65c8c0"
              },
              type: "CASE_TASK",
              width: 70,
              height: 70,
              position: {
                x: 730.4740256429384,
                y: 288.0103714395168
              },
              selected: false,
              positionAbsolute: {
                x: 730.4740256429384,
                y: 288.0103714395168
              }
            },
            {
              id: "A6AjnC1ORd",
              data: {
                id: "b2aa8ec0-fc91-4e4c-a000-64c04655d64f",
                tags: ["CreateWorkflow"],
                then: "User should be able create workflow successfully",
                type: 2,
                when: "User selects flow application from home page of data-portal, user will be navigated to create workflow page, user now fill the valid name of new workflow and click on submit button",
                given:
                  "User having access to Flow app and a team access for creating workflow in data portal. User has workflow name which does not exists in the team",
                label: "TCID0002",
                seqNo: "0002",
                title: "Validate whether Data post user is able to Create a new workflow successfully.",
                enabled: true,
                settings: {
                  sleep: {
                    timeType: 0
                  },
                  screenshot: 0
                },
                AccountId: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
                createdAt: "2024-07-13 18:53:57",
                deletedAt: null,
                execSteps: [
                  {
                    data: {
                      by: "xpath",
                      value: "${DATA_PORTAL}",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "navigateToURL"
                  },
                  {
                    data: {
                      by: "id",
                      value: "${OKTA_USERNAME}",
                      element: "okta-signin-username"
                    },
                    enabled: true,
                    actionType: "setText"
                  },
                  {
                    data: {
                      by: "id",
                      value: "${OKTA_PASSWORD}",
                      element: "okta-signin-password"
                    },
                    enabled: true,
                    actionType: "setText"
                  },
                  {
                    data: {
                      by: "id",
                      element: "okta-signin-submit"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "delay"
                  },
                  {
                    data: {
                      by: "xpath",
                      element: "/html/body/div[2]/div/main/div[2]/div/div/form[1]/div[2]/input"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "delay"
                  },
                  {
                    data: {
                      by: "id",
                      element: "enrich_flow"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "delay"
                  },
                  {
                    data: {
                      by: "xpath"
                    },
                    enabled: true,
                    actionType: "captureScreenshot"
                  },
                  {
                    data: {
                      by: "id",
                      value: "auto-sanity-${RELEASE_VERSION}",
                      element: "create-workflow"
                    },
                    enabled: true,
                    actionType: "setText"
                  },
                  {
                    data: {
                      by: "id",
                      element: "create-workflow-submit"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "id",
                      value: "Workflow Created Successfully",
                      element: "swal2-title"
                    },
                    enabled: true,
                    actionType: "verifyElementHasTextValue"
                  },
                  {
                    data: {
                      by: "xpath"
                    },
                    enabled: true,
                    actionType: "captureScreenshot"
                  },
                  {
                    data: {
                      by: "xpath",
                      element: "/html/body/div[2]/div/div[6]/button[1]"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 10000
                    },
                    enabled: true,
                    actionType: "delay"
                  }
                ],
                updatedAt: "2024-08-11 23:59:38",
                conditions: [
                  {
                    fallback: "6fd09294-0157-4d2e-b8cc-4cce520afdfb",
                    isActive: true,
                    statement: [
                      {
                        rightOp: "2",
                        operator: "eq"
                      }
                    ]
                  },
                  {
                    fallback: "b2aa8ec0-fc91-4e4c-a000-64c04655d64f",
                    isActive: true,
                    statement: [
                      {
                        rightOp: "3",
                        operator: "eq"
                      }
                    ]
                  }
                ],
                TestScenarioId: "8454c283-7a19-4045-9d5a-e9120e65c8c0"
              },
              type: "CASE_TASK",
              width: 70,
              height: 70,
              dragging: true,
              position: {
                x: 838,
                y: 293
              },
              selected: false,
              positionAbsolute: {
                x: 838,
                y: 293
              }
            },
            {
              id: "g9ke-y8Eez",
              data: {
                id: "35c06cf4-bbd1-43a0-a473-1e91de0ad024",
                tags: ["ValidationTest", "InvalidInput", "ErrorMessages"],
                then: 'User should be able to see error message "failed to create a workflow"',
                type: 2,
                when: "User selects flow application from home page of data-portal, user will be navigated to create workflow page, user now fill the name of new workflow and click on submit button",
                given:
                  "User having access to Flow app and a team access for creating workflow in data portal. User has workflow name which already exists in the team",
                label: "TCID0003",
                seqNo: "0003",
                title: "Validate whether data portal user see error messages for invalid inputs in Workflow creation page.",
                enabled: true,
                settings: {
                  sleep: {
                    timeType: 0
                  },
                  screenshot: 0
                },
                AccountId: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
                createdAt: "2024-07-13 18:54:20",
                deletedAt: null,
                execSteps: [
                  {
                    data: {
                      by: "xpath",
                      value: "${DATA_PORTAL}",
                      interval: 0
                    },
                    enabled: true,
                    actionType: "navigateToURL"
                  },
                  {
                    data: {
                      by: "id",
                      value: "${OKTA_USERNAME}",
                      element: "okta-signin-username"
                    },
                    enabled: true,
                    actionType: "setText"
                  },
                  {
                    data: {
                      by: "id",
                      value: "${OKTA_PASSWORD}",
                      element: "okta-signin-password"
                    },
                    enabled: true,
                    actionType: "setText"
                  },
                  {
                    data: {
                      by: "id",
                      element: "okta-signin-submit"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "delay"
                  },
                  {
                    data: {
                      by: "xpath",
                      element: "/html/body/div[2]/div/main/div[2]/div/div/form[1]/div[2]/input"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "delay"
                  },
                  {
                    data: {
                      by: "id",
                      element: "enrich_flow"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "delay"
                  },
                  {
                    data: {
                      by: "id",
                      value: "invalid-workflow/",
                      element: "create-workflow"
                    },
                    enabled: true,
                    actionType: "setText"
                  },
                  {
                    data: {
                      by: "id",
                      value: "Workflow Name Accepts only alpha numerics and '-'",
                      element: "create-workflow-error"
                    },
                    enabled: true,
                    actionType: "verifyElementHasTextValue"
                  },
                  {
                    data: {
                      by: "xpath"
                    },
                    enabled: true,
                    actionType: "captureScreenshot"
                  },
                  {
                    data: {
                      by: "id",
                      value: "auto-sanity-${RELEASE_VERSION}",
                      element: "create-workflow"
                    },
                    enabled: true,
                    actionType: "setText"
                  },
                  {
                    data: {
                      by: "id",
                      element: "create-workflow-submit"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "id",
                      element: "create-workflow-submit",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "delay"
                  },
                  {
                    data: {
                      by: "id",
                      value: "workflow: admin-auto-sanity-${RELEASE_VERSION} couldn't be validated, Please try again!",
                      element: "swal2-title"
                    },
                    enabled: true,
                    actionType: "verifyElementHasTextValue"
                  },
                  {
                    data: {
                      by: "className",
                      element: "swal2-confirm"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "delay"
                  }
                ],
                updatedAt: "2024-08-12 00:01:51",
                TestScenarioId: "8454c283-7a19-4045-9d5a-e9120e65c8c0"
              },
              type: "CASE_TASK",
              width: 70,
              height: 70,
              position: {
                x: 1027,
                y: 166
              }
            },
            {
              id: "eKteYKxm8K",
              data: {
                id: "6bc8cf7a-0277-409d-a33d-495868e0ff43",
                tags: ["SparkStageTest"],
                then: "User should be able to add SPARK stage successfully to workflow. And also Modify the SPARK stage successfully.",
                type: 2,
                when: "User navigates to workflow operations page and selects the existing workflow. Select the source SPARK and target job type for stage, click on Add Stage button.",
                given: "User has created a workflow in flow app of data portal.",
                label: "TCID0004",
                seqNo: "0004",
                title: "Add the Spark stage to the existing workflow in Data Portal and also verify configuration change",
                enabled: true,
                settings: {},
                AccountId: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
                createdAt: "2024-07-13 18:54:39",
                deletedAt: null,
                execSteps: [
                  {
                    data: {
                      by: "xpath",
                      value: "${DATA_PORTAL}",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "navigateToURL"
                  },
                  {
                    data: {
                      by: "id",
                      value: "${OKTA_USERNAME}",
                      element: "okta-signin-username"
                    },
                    enabled: true,
                    actionType: "setText"
                  },
                  {
                    data: {
                      by: "id",
                      value: "${OKTA_PASSWORD}",
                      element: "okta-signin-password"
                    },
                    enabled: true,
                    actionType: "setText"
                  },
                  {
                    data: {
                      by: "id",
                      element: "okta-signin-submit"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "delay"
                  },
                  {
                    data: {
                      by: "xpath",
                      element: "/html/body/div[2]/div/main/div[2]/div/div/form[1]/div[2]/input"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "delay"
                  },
                  {
                    data: {
                      by: "id",
                      element: "enrich_flow"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "delay"
                  },
                  {
                    data: {
                      by: "id",
                      value: "${DATA_PORTAL}/workflow/operations/admin/admin-auto-sanity-${RELEASE_VERSION}",
                      element: "create-workflow",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "navigateToURL"
                  },
                  {
                    data: {
                      by: "xpath",
                      value: "spark",
                      element: "source-job"
                    },
                    enabled: true,
                    actionType: "selectDropDown"
                  },
                  {
                    data: {
                      by: "id",
                      element: "add-stage-btn"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "delay"
                  },
                  {
                    data: {
                      by: "id",
                      value: "spark",
                      element: "stage_name-input"
                    },
                    enabled: true,
                    actionType: "setText"
                  },
                  {
                    data: {
                      by: "id",
                      value: "test_spark",
                      element: "main_class-input"
                    },
                    enabled: true,
                    actionType: "setText"
                  },
                  {
                    data: {
                      by: "id",
                      value: "test",
                      element: "image-input"
                    },
                    enabled: true,
                    actionType: "setText"
                  },
                  {
                    data: {
                      by: "id",
                      element: "save-changes"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "delay"
                  },
                  {
                    data: {
                      by: "id",
                      value: "Stage Added Successfully",
                      element: "swal2-title"
                    },
                    enabled: true,
                    actionType: "verifyElementHasTextValue"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "captureScreenshot"
                  },
                  {
                    data: {
                      by: "className",
                      element: "swal2-cancel"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "id",
                      element: "edit-stage-0-btn"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "delay"
                  },
                  {
                    data: {
                      by: "id",
                      value: "edit",
                      element: "main_class-input"
                    },
                    enabled: true,
                    actionType: "setText"
                  },
                  {
                    data: {
                      by: "id",
                      element: "save-changes"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "delay"
                  },
                  {
                    data: {
                      by: "id",
                      value: "Stage Modified Successfully",
                      element: "swal2-title"
                    },
                    enabled: true,
                    actionType: "verifyElementHasTextValue"
                  }
                ],
                updatedAt: "2024-08-11 23:47:20",
                TestScenarioId: "8454c283-7a19-4045-9d5a-e9120e65c8c0"
              },
              type: "CASE_TASK",
              width: 70,
              height: 70,
              position: {
                x: 1111,
                y: 320
              }
            },
            {
              id: "ieGc8n6H6o",
              data: {
                id: "b636d5ae-b399-4e41-ba47-fb51b401e287",
                tags: ["UpdateSparkDelta"],
                then: "User should be able to configure the delta values for stages successfully.",
                type: 2,
                when: "User navigates to workflow QA page and selects the existing workflow. Update the delta value of stages",
                given: "User has created a workflow in flow app of data portal.",
                label: "TCID0005",
                seqNo: "0005",
                title: "Validate whether user is able to Modify the delta values of a Stage in QA Page successfully",
                enabled: true,
                settings: {
                  sleep: {
                    timeType: 0
                  },
                  screenshot: 0
                },
                AccountId: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
                createdAt: "2024-07-13 18:55:04",
                deletedAt: null,
                execSteps: [
                  {
                    data: {
                      by: "xpath",
                      value: "${DATA_PORTAL}",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "navigateToURL"
                  },
                  {
                    data: {
                      by: "id",
                      value: "${OKTA_USERNAME}",
                      element: "okta-signin-username"
                    },
                    enabled: true,
                    actionType: "setText"
                  },
                  {
                    data: {
                      by: "id",
                      value: "${OKTA_PASSWORD}",
                      element: "okta-signin-password"
                    },
                    enabled: true,
                    actionType: "setText"
                  },
                  {
                    data: {
                      by: "id",
                      element: "okta-signin-submit"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "delay"
                  },
                  {
                    data: {
                      by: "xpath",
                      element: "/html/body/div[2]/div/main/div[2]/div/div/form[1]/div[2]/input"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "delay"
                  },
                  {
                    data: {
                      by: "id",
                      element: "enrich_flow"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "delay"
                  },
                  {
                    data: {
                      by: "id",
                      value: "${DATA_PORTAL}/workflow/release/qa/admin-auto-sanity-${RELEASE_VERSION}",
                      element: "create-workflow",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "navigateToURL"
                  },
                  {
                    data: {
                      by: "id",
                      value: "spark",
                      element: "update-delta-0"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "captureScreenshot"
                  },
                  {
                    data: {
                      by: "xpath",
                      element: "/html/body/div[3]/div/div/form/div[3]/button[2]"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "id",
                      value: "spark",
                      element: "stage_name-input",
                      interval: 10000
                    },
                    enabled: true,
                    actionType: "delay"
                  },
                  {
                    data: {
                      by: "id",
                      value: "Delta Control Values Modified Successfully",
                      element: "swal2-title"
                    },
                    enabled: true,
                    actionType: "verifyElementHasTextValue"
                  }
                ],
                updatedAt: "2024-08-11 23:51:57",
                TestScenarioId: "8454c283-7a19-4045-9d5a-e9120e65c8c0"
              },
              type: "CASE_TASK",
              width: 70,
              height: 70,
              position: {
                x: 1114,
                y: 491
              }
            },
            {
              id: "a21Tt9LUt3",
              data: {
                id: "b636d5ae-b399-4e41-ba47-fb51b401e287",
                tags: ["UpdateSparkDelta"],
                then: "User should be able to configure the delta values for stages successfully.",
                type: 2,
                when: "User navigates to workflow QA page and selects the existing workflow. Update the delta value of stages",
                given: "User has created a workflow in flow app of data portal.",
                label: "TCID0005",
                seqNo: "0005",
                title: "Validate whether user is able to Modify the delta values of a Stage in QA Page successfully",
                enabled: true,
                settings: {
                  sleep: {
                    timeType: 0
                  },
                  screenshot: 0
                },
                AccountId: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
                createdAt: "2024-07-13 18:55:04",
                deletedAt: null,
                execSteps: [
                  {
                    data: {
                      by: "xpath",
                      value: "${DATA_PORTAL}",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "navigateToURL"
                  },
                  {
                    data: {
                      by: "id",
                      value: "${OKTA_USERNAME}",
                      element: "okta-signin-username"
                    },
                    enabled: true,
                    actionType: "setText"
                  },
                  {
                    data: {
                      by: "id",
                      value: "${OKTA_PASSWORD}",
                      element: "okta-signin-password"
                    },
                    enabled: true,
                    actionType: "setText"
                  },
                  {
                    data: {
                      by: "id",
                      element: "okta-signin-submit"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "delay"
                  },
                  {
                    data: {
                      by: "xpath",
                      element: "/html/body/div[2]/div/main/div[2]/div/div/form[1]/div[2]/input"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "delay"
                  },
                  {
                    data: {
                      by: "id",
                      element: "enrich_flow"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "delay"
                  },
                  {
                    data: {
                      by: "id",
                      value: "${DATA_PORTAL}/workflow/release/qa/admin-auto-sanity-${RELEASE_VERSION}",
                      element: "create-workflow",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "navigateToURL"
                  },
                  {
                    data: {
                      by: "id",
                      value: "spark",
                      element: "update-delta-0"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "xpath",
                      interval: 5000
                    },
                    enabled: true,
                    actionType: "captureScreenshot"
                  },
                  {
                    data: {
                      by: "xpath",
                      element: "/html/body/div[3]/div/div/form/div[3]/button[2]"
                    },
                    enabled: true,
                    actionType: "click"
                  },
                  {
                    data: {
                      by: "id",
                      value: "spark",
                      element: "stage_name-input",
                      interval: 10000
                    },
                    enabled: true,
                    actionType: "delay"
                  },
                  {
                    data: {
                      by: "id",
                      value: "Delta Control Values Modified Successfully",
                      element: "swal2-title"
                    },
                    enabled: true,
                    actionType: "verifyElementHasTextValue"
                  }
                ],
                updatedAt: "2024-08-11 23:51:57",
                TestScenarioId: "8454c283-7a19-4045-9d5a-e9120e65c8c0"
              },
              type: "CASE_TASK",
              width: 70,
              height: 70,
              position: {
                x: 1283,
                y: 156
              }
            },
            {
              id: "-DYRxpMgaZ",
              data: {
                id: "649d3717-33ae-4a1d-8c1c-a949343f4995",
                tags: ["listWorkflow"],
                then: "",
                type: 1,
                when: "",
                given: "hello",
                label: "TCID0011",
                seqNo: "0011",
                title: "test",
                enabled: true,
                settings: {
                  host: "${API_URL}",
                  path: "/data_portal/apps?user_email=ykrishnaraju@ebates.com",
                  sleep: {
                    interval: 2000,
                    timeType: 0
                  },
                  header: [
                    {
                      key: "client-agent",
                      value: "rr-data-portal"
                    },
                    {
                      key: "authorization",
                      value: "Bearer ${JWT_TOKEN}"
                    }
                  ],
                  method: "GET",
                  timeout: 5000
                },
                AccountId: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
                createdAt: "2024-08-08 13:43:36",
                deletedAt: null,
                execSteps: {
                  resBody: "{}",
                  statusCode: 200
                },
                updatedAt: "2024-08-12 00:45:24",
                TestScenarioId: "ea14bde7-7b95-419d-a26f-1f0b16c4d4e1"
              },
              type: "CASE_TASK",
              width: 70,
              height: 70,
              position: {
                x: 1459,
                y: 233
              }
            }
          ]
        },
        updatedBy: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
        ProjectMasterId: "6a1eb759-37a1-4ee5-a097-b54dd1ce3dd0",
        AccountId: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
        TenantId: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
        createdAt: "2024-08-25T18:35:00.742Z",
        updatedAt: "2024-09-27T15:30:47.265Z",
        TestCases: [
          {
            label: "TCID0001",
            seqNo: "0001",
            enabled: true,
            id: "24cb8503-d892-475b-92c7-cd92f5e37cf3",
            type: 1,
            title: "Switch Team API\nCheck whether Switch Team API Call is successful",
            given: "",
            when: "",
            then: "",
            execSteps: {
              reqBody: '{"user_email":"${OKTA_USERNAME}@ebates.com","team_name":"admin"}',
              reqbody: '{"user_email":"${OKTA_USERNAME}@ebates.com","team_name":"admin"}',
              resBody: "",
              condition: 'response?.meta?.status?.code === "OK" && response?.data === "records updated/inserted successfully"',
              statusCode: 200
            },
            settings: {
              host: "${API_URL}",
              path: "/flow/team",
              sleep: {
                interval: 2000,
                timeType: 0
              },
              header: [
                {
                  key: "client-agent",
                  value: "rr-data-portal"
                },
                {
                  key: "authorization",
                  value: "Bearer ${JWT_TOKEN}"
                }
              ],
              method: "PUT",
              timeout: 5000
            },
            tags: ["SwitchTeam"],
            updatedBy: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
            AccountId: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
            TestScenarioId: "5c419899-d709-4626-a6cc-37553bbd07bb",
            TenantId: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
            createdAt: "2024-08-25T18:35:00.742Z",
            updatedAt: "2024-08-29T06:35:53.018Z",
            deletedAt: null
          },
          {
            label: "TCID0002",
            seqNo: "0002",
            enabled: true,
            id: "ad79bc57-a896-4c5a-acbb-76bacc7697ab",
            type: 1,
            title: "Fetch List of Apps\nCheck user is having At least one App Assigned",
            given: "",
            when: "",
            then: "",
            execSteps: {
              resBody: "",
              condition: "response?.data?.length > 1",
              statusCode: 200
            },
            settings: {
              host: "${API_URL}",
              path: "/data_portal/apps?user_email=${OKTA_USERNAME}@ebates.com",
              sleep: {
                interval: 2000,
                timeType: 0
              },
              header: [
                {
                  key: "client-agent",
                  value: "rr-data-portal"
                },
                {
                  key: "authorization",
                  value: "Bearer ${JWT_TOKEN}"
                }
              ],
              method: "GET",
              timeout: 5000
            },
            tags: ["ListOfApps"],
            updatedBy: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
            AccountId: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
            TestScenarioId: "5c419899-d709-4626-a6cc-37553bbd07bb",
            TenantId: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
            createdAt: "2024-08-25T18:35:00.742Z",
            updatedAt: "2024-08-29T06:33:09.408Z",
            deletedAt: null
          },
          {
            label: "TCID0003",
            seqNo: "0003",
            enabled: true,
            id: "5545bf1d-cf0c-48b7-af37-1c4514d44896",
            type: 1,
            title: "Fetch list of Teams\nCheck whether API responds list of Teams assign for User",
            given: "",
            when: "",
            then: "",
            execSteps: {
              resBody: "",
              condition: "response?.data?.length > 1",
              statusCode: 200
            },
            settings: {
              host: "${API_URL}",
              path: "/flow/teams?user_email=${OKTA_USERNAME}@ebates.com",
              sleep: {
                interval: 2000,
                timeType: 0
              },
              header: [
                {
                  key: "client-agent",
                  value: "rr-data-portal"
                },
                {
                  key: "authorization",
                  value: "Bearer ${JWT_TOKEN}"
                }
              ],
              method: "GET",
              timeout: 5000
            },
            tags: ["ListOfTeams"],
            updatedBy: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
            AccountId: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
            TestScenarioId: "5c419899-d709-4626-a6cc-37553bbd07bb",
            TenantId: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
            createdAt: "2024-08-25T18:35:00.742Z",
            updatedAt: "2024-08-25T18:35:00.757Z",
            deletedAt: null
          },
          {
            label: "TCID0004",
            seqNo: "0004",
            enabled: true,
            id: "7e80c611-a4e8-4f1e-a690-7d87aa8dc73c",
            type: 1,
            title: "Create Workflow API\nCheck whether workflow is created successful",
            given: "",
            when: "",
            then: "",
            execSteps: {
              reqBody: '{"email_notification_list":"${OKTA_USERNAME}@ebates.com"}',
              reqbody: '{"email_notification_list":"${OKTA_USERNAME}@ebates.com"}',
              resBody: "",
              condition: 'response?.meta?.status?.code === "OK" && response?.meta?.status?.message.includes("created successfully")',
              statusCode: 200
            },
            settings: {
              host: "${API_URL}",
              path: "/flow/team/admin/workflow/admin-api-test-${RELEASE_VERSION}",
              sleep: {
                interval: 2000,
                timeType: 0
              },
              header: [
                {
                  key: "client-agent",
                  value: "rr-data-portal"
                },
                {
                  key: "authorization",
                  value: "Bearer ${JWT_TOKEN}"
                }
              ],
              method: "POST",
              timeout: 5000
            },
            tags: ["SwitchTeam"],
            updatedBy: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
            AccountId: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
            TestScenarioId: "5c419899-d709-4626-a6cc-37553bbd07bb",
            TenantId: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
            createdAt: "2024-08-25T18:35:00.742Z",
            updatedAt: "2024-08-25T18:35:00.756Z",
            deletedAt: null
          },
          {
            label: "TCID0005",
            seqNo: "0005",
            enabled: true,
            id: "5bba7c63-ea59-4c85-b3bb-e4b29ed1802f",
            type: 1,
            title: "Fetch list of Workflows\nCheck whether API responds list of Workflows of Team",
            given: "",
            when: "",
            then: "",
            execSteps: {
              resBody: "",
              condition:
                'response?.data?.contents?.length > 1 &&  response?.data?.contents?.filter(c=>c.job_name === "admin-api-test-${RELEASE_VERSION}").length > 0',
              statusCode: 200
            },
            settings: {
              host: "${API_URL}",
              path: "/flow/s3/files?s3_bucket=flow-dev-configs-us-west-2-876867937997&s3_path=admin/json_configs/&format_path=True",
              sleep: {
                interval: 2000,
                timeType: 0
              },
              header: [
                {
                  key: "client-agent",
                  value: "rr-data-portal"
                },
                {
                  key: "authorization",
                  value: "Bearer ${JWT_TOKEN}"
                }
              ],
              method: "GET",
              timeout: 5000
            },
            tags: ["ListOfWorkflow"],
            updatedBy: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
            AccountId: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
            TestScenarioId: "5c419899-d709-4626-a6cc-37553bbd07bb",
            TenantId: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
            createdAt: "2024-08-25T18:35:00.742Z",
            updatedAt: "2024-08-25T18:35:00.757Z",
            deletedAt: null
          }
        ]
      },
      position: {
        x: 733.71875,
        y: 230
      },
      width: 106,
      height: 50
    },
    {
      id: "MP5oDlW0QH",
      type: "CASE_TASK",
      data: {
        label: "TCID0007",
        seqNo: "0007",
        enabled: true,
        id: "bb0fd864-a9ff-42ad-ab2f-441384968b30",
        type: 1,
        title: "Validate List Secrets from Preview",
        given: "",
        when: "",
        then: "",
        execSteps: {
          statusCode: 200,
          condition: '$response.meta?.status?.code === "OK" && $response.data?.length > 0'
        },
        settings: {
          sleep: {
            interval: 2000,
            timeType: 0
          },
          method: "GET",
          host: "${API_PREVIEW_URL}",
          path: "/flow/secret/list?team_name=${TEAM_NAME}",
          header: [
            {
              key: "authorization",
              value: "Bearer ${JWT_TOKEN}",
              description: "Access Token"
            },
            {
              key: "client-agent",
              value: "rr-data-portal",
              description: "Client Agent"
            }
          ]
        },
        tags: ["ListSecrets"],
        updatedBy: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
        AccountId: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
        TestScenarioId: "e608a733-c91c-44ab-9ccf-540344c7b9a0",
        TenantId: "91d658d0-2baf-4eb8-9333-f3923a51fb15",
        createdAt: "2024-10-01T11:57:09.179Z",
        updatedAt: "2024-10-01T14:12:51.225Z",
        deletedAt: null
      },
      position: {
        x: 724.71875,
        y: 405
      },
      width: 70,
      height: 70,
      selected: true,
      positionAbsolute: {
        x: 724.71875,
        y: 405
      },
      dragging: true
    },
    {
      id: "pplwXvuISl",
      type: "TIMER_TASK",
      data: {
        timer: 0,
        label: "Timer Event"
      },
      position: {
        x: 1160.71875,
        y: 317
      },
      width: 56,
      height: 40
    }
  ],
  edges: [
    {
      source: "start",
      sourceHandle: "start-node",
      target: "ilOVa0MpUP",
      targetHandle: "target:SCENARIO_TASK",
      animated: true,
      markerEnd: {
        type: "arrowclosed",
        color: "rgb(148 163 184)"
      },
      type: "default",
      id: "reactflow__edge-startstart-node-ilOVa0MpUPtarget:SCENARIO_TASK"
    },
    {
      source: "start",
      sourceHandle: "start-node",
      target: "MP5oDlW0QH",
      targetHandle: "target:CASE_TASK",
      animated: true,
      markerEnd: {
        type: "arrowclosed",
        color: "rgb(148 163 184)"
      },
      type: "default",
      id: "reactflow__edge-startstart-node-MP5oDlW0QHtarget:CASE_TASK"
    },
    {
      source: "ilOVa0MpUP",
      sourceHandle: "source:SCENARIO_TASK",
      target: "pplwXvuISl",
      targetHandle: "target:pplwXvuISl",
      animated: true,
      markerEnd: {
        type: "arrowclosed",
        color: "rgb(148 163 184)"
      },
      type: "default",
      id: "reactflow__edge-ilOVa0MpUPsource:SCENARIO_TASK-pplwXvuISltarget:pplwXvuISl"
    },
    {
      source: "MP5oDlW0QH",
      sourceHandle: "source:CASE_TASK",
      target: "pplwXvuISl",
      targetHandle: "target:pplwXvuISl",
      animated: true,
      markerEnd: {
        type: "arrowclosed",
        color: "rgb(148 163 184)"
      },
      type: "default",
      id: "reactflow__edge-MP5oDlW0QHsource:CASE_TASK-pplwXvuISltarget:pplwXvuISl"
    }
  ]
};

const tree = JSONToJobTree(json);
console.log(tree.toString());
