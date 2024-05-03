import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  NavigationContainerRefWithCurrent,
  StackActions,
  useNavigationContainerRef,
} from "@react-navigation/native";
import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { NavigationContainer } from "@react-navigation/native";
import { LogBox, Platform } from "react-native";

const navigationPage = "NavigationPage";

export interface NavigatorActions {
  push: <T>(children: ReactNode) => Promise<T | undefined>;
  pop: <T>(result?: T) => void;
  replace: <T>(children: ReactNode) => Promise<T | undefined>;
}

interface NavigatorRouteParams {
  view?: ReactNode;
  completer?: () => void;
}

interface NavigatorProps {
  children: ReactNode;
  headerShown?: boolean;
}

const NavigatorContext = createContext<NavigatorActions | undefined>(undefined);

let navigatorIndex = 0;
let pageIndex = 0;

let navigatorActivity = new Array<number>();

let navigatorRegistery = new Map<
  number,
  NavigationContainerRefWithCurrent<{}>
>();

export const Navigator: FC<NavigatorProps> = ({ children, headerShown }) => {
  navigatorIndex++;
  const navigatorIndexRef = useRef(navigatorIndex);
  const navigatorRef = useNavigationContainerRef();
  navigatorRegistery.set(navigatorIndex, navigatorRef);
  const routeCount = useRef(0);

  if (navigatorIndex == 1 && Platform.OS == "web") {
    useLayoutEffect(() => {
      const backHandler = (event: PopStateEvent | undefined) => {
        const newIndex = event?.state?.index;
        const forward = newIndex > pageIndex;
        pageIndex = newIndex || 0;
        const targetNavigator = navigatorRegistery.get(
          navigatorActivity.at(-1)!,
        );
        if (targetNavigator === undefined) return;
        if (forward) {
          navigatorActivity.push(-1);
          window.history.back();
          executor.execute(() => {
            navigatorActivity.pop();
          });
          return;
        }
        executor.execute(() => {
          if (targetNavigator.canGoBack()) {
            // @ts-ignore
            targetNavigator.getState()?.routes?.at(-1)?.params?.completer(null);
            targetNavigator.dispatch(StackActions.pop());
            navigatorActivity.pop();
          }
        });
      };
      window.addEventListener("popstate", backHandler);
      return () => window.removeEventListener("popstate", backHandler);
    }, []);
  }

  useEffect(() => {
    return () => {
      navigatorActivity.push(-1);
      for (let i = 0; i < routeCount.current; i++) {
        executor.execute(() => window.history.back());
      }
      executor.execute(() => navigatorActivity.pop());
    };
  }, []);

  const push = async <T,>(children: ReactNode): Promise<T | undefined> => {
    routeCount.current++;
    navigatorActivity.push(navigatorIndexRef.current);
    const newIndex = pageIndex + 1;
    window.history.pushState({ index: newIndex }, "");
    pageIndex = newIndex;
    return new Promise<T | undefined>((resolve, _) => {
      navigatorRef.dispatch(
        StackActions.push(navigationPage, {
          view: children,
          completer: resolve,
        }),
      );
    });
  };

  const replace = async <T,>(children: ReactNode): Promise<T | undefined> => {
    navigatorActivity.push(navigatorIndexRef.current);
    return new Promise<T | undefined>((resolve, _) => {
      navigatorRef.dispatch(
        StackActions.replace(navigationPage, {
          view: children,
          completer: resolve,
        }),
      );
    });
  };

  const pop = <T,>(result?: T): void => {
    routeCount.current--;
    navigatorActivity.push(navigatorIndexRef.current);
    // @ts-ignore
    navigatorRef.getState().routes.at(-1).params.completer(result);
    if (Platform.OS == "web") {
      executor.execute(() => {
        window.history.back();
      });
      return;
    }
    navigatorRef.dispatch(StackActions.pop());
  };

  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer ref={navigatorRef} independent={true}>
      <NavigatorContext.Provider
        value={{
          push,
          replace,
          pop,
        }}
      >
        <Stack.Navigator initialRouteName={navigationPage}>
          <Stack.Screen
            options={{
              headerShown,
            }}
            name={navigationPage}
            children={({ route }) => {
              const params = route.params as NavigatorRouteParams;
              return (
                <NavigatorPage completer={params?.completer}>
                  {params?.view ?? children}
                </NavigatorPage>
              );
            }}
          />
        </Stack.Navigator>
      </NavigatorContext.Provider>
    </NavigationContainer>
  );
};

const NavigatorPage = ({
  children,
  completer,
}: {
  children: ReactNode;
  completer?: () => void;
}) => {
  useEffect(() => {
    return completer;
  }, []);
  return <>{children}</>;
};

export function useNavigator(): NavigatorActions | undefined {
  try {
    return useContext(NavigatorContext);
  } catch {
    return undefined;
  }
}

//warning ignores
const nestedError =
  "Found screens with the same name nested inside one another. Check:";
const nonSerializable =
  "Non-serializable values were found in the navigation state. Check:";

LogBox.ignoreLogs([nestedError, nonSerializable]);

const originalConsoleWarn = console.warn;
console.warn = (...args: (string | string[])[]) => {
  if (typeof args[0] === "string") {
    if (args[0].includes(nestedError) || args[0].includes(nonSerializable)) {
      return;
    }
  }
  originalConsoleWarn.apply(console, args);
};

class QueueExecute {
  private q = new Array<() => void>();
  private busy = false;
  constructor(private timeout: number) {}

  public execute(func: () => void) {
    if (this.busy) {
      this.q.push(func);
      return;
    }
    this.busy = true;
    setTimeout(() => {
      this.busy = false;
      func();
      if (this.q.length > 0) {
        this.execute(this.q.pop()!);
      }
    }, this.timeout);
  }
}
const executor = new QueueExecute(100);
