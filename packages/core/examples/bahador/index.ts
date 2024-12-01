import type { Types } from '@cornerstonejs/core';
import {
  RenderingEngine,
  Enums,
  imageLoader,
  metaData,
} from '@cornerstonejs/core';
import {
  initDemo,
  setTitleAndDescription,
  addDropdownToToolbar,
} from '../../../../utils/demo/helpers';
import hardcodedMetaDataProvider from './hardcodedMetaDataProvider';
import registerWebImageLoader from './registerWebImageLoader';
import * as cornerstoneTools from '@cornerstonejs/tools';

// This is for debugging purposes
console.warn(
  'Click on index.ts to open source code for this example --------->'
);

const {
  HipCupTool,
  PanTool,
  WindowLevelTool,
  // StackScrollMouseWheelTool,
  ZoomTool,
  LengthTool,
  PlanarRotateTool,
  ETDRSGridTool,
  ToolGroupManager,
  Enums: csToolsEnums,
} = cornerstoneTools;

const { ViewportType } = Enums;
const { MouseBindings } = csToolsEnums;

const toolGroupId = 'STACK_TOOL_GROUP_ID';
const leftClickTools = [
  HipCupTool.toolName,
  WindowLevelTool.toolName,
  PlanarRotateTool.toolName,
  ETDRSGridTool.toolName,
  LengthTool.toolName,
];
const defaultLeftClickTool = leftClickTools[0];
let currentLeftClickTool = leftClickTools[0];

// ======== Set up page ======== //
setTitleAndDescription(
  'Hip Planning Surgery',
  'Demo version of planning surgery on jpg image in web'
);

const content = document.getElementById('content');

const element = document.createElement('div');

// Disable right click context menu so we can have right click tools
element.oncontextmenu = (e) => e.preventDefault();

element.id = 'cornerstone-element';
element.style.width = '800px';
element.style.height = '800px';

content.appendChild(element);

addDropdownToToolbar({
  options: {
    values: leftClickTools,
    defaultValue: defaultLeftClickTool,
  },
  onSelectedValueChange: (selectedValue) => {
    const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);

    toolGroup.setToolPassive(currentLeftClickTool);

    toolGroup.setToolActive(<string>selectedValue, {
      bindings: [
        {
          mouseButton: MouseBindings.Primary, // Left Click
        },
      ],
    });

    currentLeftClickTool = selectedValue;
  },
});
const renderingEngineId = 'myRenderingEngine';
const viewportId = 'COLOR_STACK';

// png images hosted on web (s3 with cors enabled) from the visible human project
// https://www.nlm.nih.gov/research/visible/visible_human.html
const imageIds = [
  'web:https://digivcardtest.s3.amazonaws.com/storage/images/photo_2024-11-04_19-13-19.jpg',
];

registerWebImageLoader(imageLoader);

// ============================= //

/**
 * Runs the demo
 */
async function run() {
  // Init Cornerstone and related libraries
  await initDemo();

  // Add tools to Cornerstone3D
  cornerstoneTools.addTool(PanTool);
  cornerstoneTools.addTool(HipCupTool);
  cornerstoneTools.addTool(WindowLevelTool);
  // cornerstoneTools.addTool(StackScrollMouseWheelTool);
  cornerstoneTools.addTool(ZoomTool);
  cornerstoneTools.addTool(PlanarRotateTool);
  cornerstoneTools.addTool(ETDRSGridTool);
  cornerstoneTools.addTool(LengthTool);

  // Define a tool group, which defines how mouse events map to tool commands for
  // Any viewport using the group
  const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

  // Add tools to the tool group
  toolGroup.addTool(WindowLevelTool.toolName);
  toolGroup.addTool(PanTool.toolName);
  toolGroup.addTool(ZoomTool.toolName);
  // toolGroup.addTool(StackScrollMouseWheelTool.toolName, { loop: false });
  toolGroup.addTool(PlanarRotateTool.toolName);
  toolGroup.addTool(ETDRSGridTool.toolName);
  toolGroup.addTool(LengthTool.toolName);
  toolGroup.addTool(HipCupTool.toolName);

  // Set the initial state of the tools, here all tools are active and bound to
  // Different mouse inputs
  toolGroup.setToolActive(defaultLeftClickTool, {
    bindings: [
      {
        mouseButton: MouseBindings.Primary, // Left Click
      },
    ],
  });
  toolGroup.setToolActive(PanTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Auxiliary, // Middle Click
      },
    ],
  });
  toolGroup.setToolActive(ZoomTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Secondary, // Right Click
      },
    ],
  });

  metaData.addProvider(
    // @ts-ignore
    (type, imageId) => hardcodedMetaDataProvider(type, imageId, imageIds),
    10000
  );

  // Instantiate a rendering engine
  const renderingEngine = new RenderingEngine(renderingEngineId);

  // Create a stack viewport
  const viewportId = 'CT_STACK';
  const viewportInput = {
    viewportId,
    type: ViewportType.STACK,
    element: element,
    defaultOptions: {
      background: <Types.Point3>[0.2, 0, 0.2],
    },
  };
  renderingEngine.enableElement(viewportInput);
  toolGroup.addViewport(viewportId, renderingEngineId);
  // Get the stack viewport that was created
  const viewport = <Types.IStackViewport>(
    renderingEngine.getViewport(viewportId)
  );

  viewport.setStack(imageIds);

  cornerstoneTools.utilities.stackPrefetch.enable(viewport.element);

  viewport.render();
}

run();
