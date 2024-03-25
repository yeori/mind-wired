import { UserDefinedEditor, UserDefinedRenderer } from "../node";

export type KeyExtractor<T, K> = (item: T) => K;

export type DatasourceOptionalParam<T> = {
  renderer?: UserDefinedRenderer<T>;
  editor?: UserDefinedEditor<T>;
};
/**
 * @template T - type of user data, which is rendered as node
 * @template K - type of key for each data T
 */
export class BaseDataSource<T, K> {
  private readonly _items: T[] = [];
  private readonly _itemMap = new Map<K, T>();
  /**
   *
   * @param id unique identifier for datasource
   * @param keyOf extracts key from each item(user data)
   */
  constructor(readonly id: string, readonly keyOf: KeyExtractor<T, K>) {}
  getData(key: K) {
    return this._itemMap.get(key);
  }
  /**
   *
   * @param items user data to use
   */
  setData(items: T[]) {
    items.forEach((item) => {
      const key = this.keyOf(item);
      const existing = this._itemMap.get(key);
      if (existing) {
        throw new Error(
          `duplicated item found: key[${key}], value is ${existing}`
        );
      }
      this._itemMap.set(key, item);
    });
    this._items.push(...items);
  }
  containsData(data: T) {
    const key = this.keyOf(data);
    return this.containsKey(key);
  }
  containsKey(key: K) {
    return this._itemMap.has(key);
  }
}
/**
 * Placeholder for all datasources
 */
export class DataSourceFactory {
  private readonly _dsMap = new Map<string, BaseDataSource<any, any>>();
  /**
   * mapping datasource(key) to node render(value)
   * @key datasource id
   * @value name of custom node renderer
   */
  private _dsToRendererMap = new Map<string, string>();
  /**
   * mapping datasource(key) to node editor(value)
   * @key datasource id
   * @value name of custom node editor
   */
  private _dsToEditorMap = new Map<string, string>();
  constructor() {}
  /**
   * creates new datasource
   *
   * @template T type of items in the datasource
   * @template K type of key for each items(default: 'string')
   * @param datasourceId unique identifier for datasource
   * @returns new datasource
   */
  createDataSource<T, K>(
    datasourceId: string,
    keyExtractor: KeyExtractor<T, K>
  ): BaseDataSource<T, K> {
    if (this._dsMap.has(datasourceId)) {
      throw new Error(`duplicated datasource id: [${datasourceId}]`);
    }
    const ds = new BaseDataSource<T, K>(datasourceId, keyExtractor);
    this._dsMap.set(datasourceId, ds);
    return ds;
  }
  /**
   *
   * @template T type of items in the datasource
   * @template K type of key for each items(default: 'string')
   * @param dataSourceId unique identifier for datasource
   * @returns datasource
   */
  getDataSource<T = any, K = string>(dataSourceId: string) {
    return this._dsMap.get(dataSourceId) as BaseDataSource<T, K>;
  }
  bindRendererMapping(ds: BaseDataSource<any, any>, rendererName: string) {
    this._dsToRendererMap.set(ds.id, rendererName);
  }
  getRendererName(dataSourceId: string) {
    return this._dsToRendererMap.get(dataSourceId);
  }
  bindEditorMapping(ds: BaseDataSource<any, any>, editorName: string) {
    this._dsToEditorMap.set(ds.id, editorName);
  }
  getEditorName(dataSourceId: string) {
    return this._dsToEditorMap.get(dataSourceId);
  }
  findDataSourceByData<T, K>(data: T) {
    return this._findBy((ds) => ds.containsData(data));
  }
  findDataSourceByKey(key: string) {
    return this._findBy((ds) => ds.containsKey(key));
  }
  private _findBy<T, K>(predicate: (ds: BaseDataSource<T, K>) => boolean) {
    const dataSources = [...this._dsMap.values()] as BaseDataSource<T, K>[];
    for (let k = 0; k < dataSources.length; k++) {
      const ds = dataSources[k];
      if (predicate(ds)) {
        return ds;
      }
    }
    return undefined;
  }
  findData<K>(key: K) {
    const ds = this._findBy<any, any>((ds) => ds.containsKey(key));
    return ds.getData(key);
  }
  clear() {
    this._dsToRendererMap.clear();
    this._dsToEditorMap.clear();
    this._dsMap.clear();
  }
}
