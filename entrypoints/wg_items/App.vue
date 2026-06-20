<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { FolderCode, Eye } from "@lucide/vue";
import {
  Empty,
  EmptyDescription,
  EmptyTitle,
  EmptyMedia,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import sockets from "./sockets.json" with { type: "json" };
import { itemTypes } from "cn-poe2-utils/api";

interface Item {
  name: string;
  typeLine: string;
  stats: string;
  isJSON: boolean;
  isText: boolean;
  data: string;
}

export interface CustomItems {
  items: Record<number, Item>;
  socketedItems: Record<number, number | null>;
}

// 获取URL参数中的shareCode
const getShareCode = (): string => {
  const params = new URLSearchParams(window.location.search);
  return params.get("shareCode") || "";
};

// 缓存storageKey，只计算一次
const storageKey = ref<string>("");

const getStorageKey = (): string => {
  if (!storageKey.value) {
    const shareCode = getShareCode();
    storageKey.value = `customItems:${shareCode}`;
  }
  return storageKey.value;
};

// 物品列表（响应式）
const items = ref<Item[]>([]);

// 存储每个插槽对应的物品索引
const socketItems = ref<Record<number, number | null>>({});

// 初始化插槽
sockets.forEach((_, index) => {
  socketItems.value[index] = null;
});

// 从storage加载数据
const loadFromStorage = async () => {
  try {
    const storageKey = getStorageKey();
    const result = await browser.storage.local.get(storageKey);
    if (result[storageKey]) {
      const customItems = result[storageKey] as CustomItems;

      // 按数字索引排序后重建数组
      const array = [];
      for (const [key, value] of Object.entries(customItems.items)) {
        array[Number(key)] = value;
      }
      items.value = array;

      if (customItems.socketedItems) {
        socketItems.value = customItems.socketedItems;
      }
    }
  } catch (error) {
    console.error("Failed to load from storage:", error);
  }
};

// 保存数据到storage
const saveToStorage = async () => {
  try {
    const customItems: CustomItems = {
      items: items.value,
      socketedItems: socketItems.value,
    };
    const storageKey = getStorageKey();
    await browser.storage.local.set({ [storageKey]: customItems });
  } catch (error) {
    console.error("Failed to save to storage:", error);
  }
};

// 页面加载时从storage读取数据
onMounted(() => {
  loadFromStorage();
});

// 计算可用的物品（未被分配的物品）
const availableItems = computed(() => {
  const usedIndices = new Set(
    Object.values(socketItems.value).filter((i): i is number => i !== null),
  );
  return items.value.map((item, index) => ({
    ...item,
    index,
    isUsed: usedIndices.has(index),
  }));
});

// 获取可选项（包括当前已选项）
const getOptionsForSocket = (socketIndex: number) => {
  const currentItemIndex = socketItems.value[socketIndex];
  return items.value
    .map((item, index) => ({
      ...item,
      index,
      isAvailable:
        index === currentItemIndex ||
        !Object.values(socketItems.value).includes(index),
    }))
    .filter((item) => item.isAvailable);
};

// 选择物品
const selectItem = (socketIndex: number, itemIndex: number | null) => {
  socketItems.value[socketIndex] = itemIndex;
  saveToStorage();
};

// 取消选择
const clearSocket = (socketIndex: number) => {
  socketItems.value[socketIndex] = null;
  saveToStorage();
};

// 删除物品
const deleteItem = (itemIndex: number) => {
  // 移除物品
  items.value.splice(itemIndex, 1);

  // 更新插槽分配
  Object.keys(socketItems.value).forEach((key) => {
    const socketIndex = Number(key);
    const currentIndex = socketItems.value[socketIndex];

    if (currentIndex === itemIndex) {
      // 如果删除的是当前分配的物品，清空分配
      socketItems.value[socketIndex] = null;
    } else if (currentIndex !== null && currentIndex > itemIndex) {
      // 如果当前分配的物品索引大于删除的索引，需要减1
      socketItems.value[socketIndex] = currentIndex - 1;
    }
  });

  saveToStorage();
};

// 退出
const exit = () => {
  window.close();
};

// 添加物品对话框
const addDialogOpen = ref(false);
const dialogInput = ref("");

// 打开添加对话框
const openAddDialog = () => {
  dialogInput.value = "";
  addDialogOpen.value = true;
};

// 关闭添加对话框
const closeAddDialog = () => {
  addDialogOpen.value = false;
  dialogInput.value = "";
};

// 判断是否是JSON
const isJsonString = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

// 从JSON数据中提取name和typeLine
const extractFromJson = (
  jsonData: itemTypes.Item,
): { name: string; typeLine: string; stats: string } => {
  const name = jsonData.name;
  const typeLine = jsonData.typeLine;

  let stats = [];
  for (const [key, value] of Object.entries(jsonData)) {
    if (key.endsWith("Mods") && Array.isArray(value)) {
      stats.push(...value);
    }
  }

  return { name, typeLine, stats: stats.join("\n") };
};

// 从文本数据中提取name和typeLine
const extractFromText = (
  text: string,
): { name: string; typeLine: string; stats: string } => {
  const lines = text.trim().split("\n");
  let name = "未知物品";
  let typeLine = "未知类型";

  let firstSeperatorIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && line.startsWith("---")) {
      firstSeperatorIndex = i;
      break;
    }
  }

  if (firstSeperatorIndex === -1) {
    return { name, typeLine, stats: text };
  }

  if (firstSeperatorIndex === 3) {
    name = "";
    typeLine = lines[2];
  } else if (firstSeperatorIndex === 4) {
    name = lines[2];
    typeLine = lines[3];
  }

  return {
    name,
    typeLine: typeLine,
    stats: lines.slice(firstSeperatorIndex + 1).join("\n"),
  };
};

// 保存物品
const saveItem = () => {
  const input = dialogInput.value.trim();

  if (!input) {
    closeAddDialog();
    return;
  }

  const isJSON = isJsonString(input);
  let itemData: Item;

  if (isJSON) {
    const jsonData = JSON.parse(input);
    const extracted = extractFromJson(jsonData);
    itemData = {
      name: extracted.name,
      typeLine: extracted.typeLine,
      stats: extracted.stats,
      isJSON: true,
      isText: false,
      data: JSON.stringify(jsonData), // 紧凑格式
    };
  } else {
    const extracted = extractFromText(input);
    itemData = {
      name: extracted.name,
      typeLine: extracted.typeLine,
      stats: extracted.stats,
      isJSON: false,
      isText: true,
      data: input,
    };
  }

  items.value.push(itemData);
  saveToStorage();
  closeAddDialog();
};
</script>

<template>
  <div class="flex h-screen bg-background text-foreground">
    <!-- 左侧：插槽列表 -->
    <div class="w-1/2 border-r border-border p-3">
      <h2 class="text-base font-semibold mb-2">插槽</h2>
      <ScrollArea class="h-[calc(100vh-4rem)]">
        <div class="space-y-1 pr-4">
          <div
            v-for="(socket, index) in sockets"
            :key="index"
            class="flex items-center gap-2 py-1"
          >
            <label
              class="text-xs font-medium min-w-0 flex-shrink-0 w-44 text-right"
            >
              {{ socket }}:
            </label>
            <select
              :value="socketItems[index] ?? ''"
              @change="
                selectItem(
                  index,
                  ($event.target as HTMLSelectElement).value
                    ? Number(($event.target as HTMLSelectElement).value)
                    : null,
                )
              "
              class="flex-1 px-2 py-1 rounded border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">未分配</option>
              <option
                v-for="item in getOptionsForSocket(index)"
                :key="item.index"
                :value="item.index"
              >
                <template v-if="item.name">{{ item.name }}, </template
                >{{ item.typeLine }}
              </option>
            </select>
            <button
              v-if="socketItems[index] !== null"
              @click="clearSocket(index)"
              class="px-2 py-1 text-xs rounded border border-border bg-secondary hover:bg-accent transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </ScrollArea>
    </div>

    <!-- 右侧：物品 -->
    <div class="w-1/2 p-3">
      <h2 class="text-base font-semibold mb-3">物品</h2>
      <!-- 物品栏 -->
      <div class="mb-3">
        <Empty v-if="items.length === 0">
          <EmptyMedia variant="icon">
            <FolderCode />
          </EmptyMedia>
          <EmptyTitle>暂无物品</EmptyTitle>
          <EmptyDescription>物品列表为空，请先添加物品</EmptyDescription>
        </Empty>
        <ScrollArea v-else class="max-h-[75vh]">
          <div class="space-y-1 pr-4">
            <div
              v-for="item in availableItems"
              :key="item.index"
              :class="[
                'p-2 rounded border border-border bg-card flex items-center gap-2',
                item.isUsed && 'opacity-50',
              ]"
            >
              <span class="text-sm font-medium flex-1">
                <template v-if="item.name">{{ item.name }}, </template
                >{{ item.typeLine }}
              </span>
              <Popover>
                <PopoverTrigger as-child>
                  <Button variant="ghost" size="icon" class="h-8 w-8">
                    <Eye class="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-80">
                  <div class="space-y-2">
                    <div v-if="item.name" class="text-sm font-medium">
                      {{ item.name }}
                    </div>
                    <div class="text-sm font-medium">{{ item.typeLine }}</div>
                    <div v-if="item.stats" class="border-t border-border pt-2">
                      <div class="text-sm whitespace-pre-wrap">
                        {{ item.stats }}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <button
                @click="deleteItem(item.index)"
                class="px-2 py-1 text-xs rounded border border-border bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </ScrollArea>
      </div>
      <!-- 按钮区 -->
      <div class="flex gap-2">
        <Button @click="openAddDialog()" variant="outline" size="sm"
          >添加</Button
        >
        <Button @click="exit()" variant="secondary" size="sm">退出</Button>
      </div>
    </div>
  </div>

  <!-- 添加物品对话框 -->
  <Dialog v-model:open="addDialogOpen">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>添加物品</DialogTitle>
        <DialogDescription>
          粘贴从游戏中复制得到的<b>文本</b>或者交易网站复制得到的<b>JSON</b>数据（使用本扩展获取）。<b
            >数据不需要翻译，中文即可。</b
          >
        </DialogDescription>
      </DialogHeader>
      <div class="py-4 overflow-auto">
        <Textarea
          v-model="dialogInput"
          placeholder="请粘贴物品数据..."
          class="min-h-[200px] max-h-[300px] overflow-y-auto resize-none"
        />
      </div>
      <DialogFooter>
        <Button variant="outline" @click="addDialogOpen = false">取消</Button>
        <Button @click="saveItem()">保存</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
