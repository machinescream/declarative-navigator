import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation, StackActions } from "@react-navigation/native";
import React, { ReactNode, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { LogBox } from "react-native";

const navigationPage = "NavigationPage";

export interface NavigatorActions {
  push: <T>(children: ReactNode) => Promise<T | undefined>;
  pop: <T>(result?: T) => void;
  replace: <T>(children: ReactNode) => Promise<T | undefined>;
}

interface NavigatorRouteParams {
  view: ReactNode;
}

export const Navigator = ({
  children,
  headerShown,
}: {
  children: ReactNode;
  headerShown?: boolean;
}) => {
  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator initialRouteName={navigationPage}>
        <Stack.Screen
          options={{
            headerShown,
          }}
          name={navigationPage}
          children={({ route }) => {
            const params = route.params as NavigatorRouteParams;
            //@ts-ignore
            return (
              <NavigatorPage completer={params?.completer}>
                {params?.view ?? children}
              </NavigatorPage>
            );
          }}
        />
      </Stack.Navigator>
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

// add callback to end of route or make in async!
export function useNavigator(): NavigatorActions {
  const navigation = useNavigation();

  const push = async <T,>(children: ReactNode) => {
    return new Promise<T | undefined>((resolve, _) => {
      navigation.dispatch(
        StackActions.push(navigationPage, {
          view: children,
          completer: resolve,
        }),
      );
    });
  };

  const replace = async <T,>(children: ReactNode) => {
    return new Promise<T | undefined>((resolve, _) => {
      navigation.dispatch(
        StackActions.replace(navigationPage, {
          view: children,
          completer: resolve,
        }),
      );
    });
  };

  const pop = <T,>(result?: T): void => {
    //@ts-ignore
    navigation.getState().routes.at(-1).params.completer(result);
    navigation.dispatch(StackActions.pop());
  };

  return {
    push,
    pop,
    replace,
  };
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
