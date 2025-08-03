import AsyncStorage from "@react-native-async-storage/async-storage";

export type Tab = {
  id: number;
  url: string;
};

const TABS_KEY = "TABS";
const SELECTED_TAB_KEY = "SELECTED_TAB";

export async function getTabsFromStorage(): Promise<Tab[]> {
  try {
    const storedTabs = await AsyncStorage.getItem(TABS_KEY);
    return storedTabs ? JSON.parse(storedTabs) : [];
  } catch (err) {
    console.error("Failed to get tabs from storage:", err);
    return [];
  }
}

export async function saveTabsToStorage(tabs: Tab[]): Promise<void> {
  try {
    await AsyncStorage.setItem(TABS_KEY, JSON.stringify(tabs));
  } catch (err) {
    console.error("Failed to save tabs to storage:", err);
  }
}

export async function addTab(newTab: Tab): Promise<Tab[]> {
  const tabs = await getTabsFromStorage();
  const updatedTabs = [...tabs, newTab];
  await saveTabsToStorage(updatedTabs);
  return updatedTabs;
}

export async function closeTab(tabId: number): Promise<Tab[]> {
  const tabs = await getTabsFromStorage();
  const updatedTabs = tabs.filter((tab) => tab.id !== tabId);
  await saveTabsToStorage(updatedTabs);
  return updatedTabs;
}

export async function setSelectedTabId(tabId: number): Promise<void> {
  await AsyncStorage.setItem(SELECTED_TAB_KEY, tabId.toString());
}

export async function getSelectedTabId(): Promise<number> {
  const id = await AsyncStorage.getItem(SELECTED_TAB_KEY);
  if (id) {
    return parseInt(id, 10);
  } else {
    setSelectedTabId(1);
    return 1;
  }
}

const ASYNC_STORAGE_TABS_KEY = "guest_tabs";
const ASYNC_STORAGE_SELECTED_TAB_KEY = "guest_selected_tab";

export async function getGuestTabsFromStorage(): Promise<Tab[]> {
  const tabsStr = await AsyncStorage.getItem(ASYNC_STORAGE_TABS_KEY);
  return tabsStr ? JSON.parse(tabsStr) : [];
}

export async function setGuestTabsToStorage(tabs: Tab[]) {
  await AsyncStorage.setItem(ASYNC_STORAGE_TABS_KEY, JSON.stringify(tabs));
}

export async function getGuestSelectedTabId(): Promise<number | null> {
  const idStr = await AsyncStorage.getItem(ASYNC_STORAGE_SELECTED_TAB_KEY);
  return idStr ? Number(idStr) : null;
}

export async function setGuestSelectedTabId(id: number) {
  await AsyncStorage.setItem(ASYNC_STORAGE_SELECTED_TAB_KEY, id.toString());
}

export async function addGuestTab(tab: Tab) {
  const tabs = await getGuestTabsFromStorage();
  tabs.push(tab);
  await setGuestTabsToStorage(tabs);
  await setGuestSelectedTabId(tab.id);
}

export async function closeGuestTab(tabId: number) {
  let tabs = await getGuestTabsFromStorage();
  tabs = tabs.filter((tab) => tab.id !== tabId);
  await setGuestTabsToStorage(tabs);
  if (tabs.length > 0) {
    await setGuestSelectedTabId(tabs[0].id);
  } else {
    await AsyncStorage.removeItem(ASYNC_STORAGE_SELECTED_TAB_KEY);
  }
}
