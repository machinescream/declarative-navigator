# Navigator

Welcome to Navigator, a modern navigation tool for React Native. Navigator embraces the power of the react-navigation library and enhances it with features designed to simplify your coding experience.

## Safer Navigation

Navigator provides a safer navigation experience by statically declaring callback invocations. This approach lets you immediately spot missing components or incorrect navigation paths, minimizing runtime errors.

## No More Zombie Navigation Actions

Forget about matching string route names with components--an error-prone task. Navigator shields you from potential runtime errors resulting from undeclared routes or leftover route names from refactoring. This means cleaner code and fewer headaches.

## Simplified Navigation Experience

Easily control your navigation logic with the Navigator hook right within your components. For an even cleaner setup, declare your navigation chains statically outside your components.

## How to Use

```tsx
<Navigator>
  <First
    onNavigate={(navigator) => {
      navigator.push(
        <Second
          onNavigate={(navigator) => {
            navigator.push(<Third />);
          }}
        />,
      );
    }}
  />
</Navigator>
```

Just define your entire navigation path outside your components in a clear and structured manner.

## Coming Soon: Web Support

Web support is in the works to ensure consistent and smooth navigation experiences across all platforms.

Jump into a new era of navigation with Navigator for a truly declarative navigation experience in your React Native projects!

## Example
```
import { View, Button } from "react-native";
import { Navigator, useNavigator } from "declarative_navigator";

export default function App() {
  return (
    // chain of navigation could be declared statically here outside of compontns,
    // this approach improves navigation safety, straitforward navigation declaration
    <Navigator>
      <First
        onNavigate={(navigator) => {
          navigator.push(
            <Second
              onNavigate={(navigator) => {
                navigator.push(<Third />);
              }}
            />,
          );
        }}
      />
    </Navigator>
  );
}

function First({
  onNavigate,
}: {
  onNavigate: (navigator: NavigatorActions) => void;
}) {
  const navigator = useNavigator();
  return (
    <View style={{ backgroundColor: "red", flex: 1, alignItems: "center" }}>
      <Button
        title="go to second"
        onPress={() => {
          //also could be used without passed callback, but strongly recomended
          //to declare navigation outside of current component
          onNavigate(navigator);
        }}
      ></Button>
    </View>
  );
}

function Second({
  onNavigate,
}: {
  onNavigate: (navigator: NavigatorActions) => void;
}) {
  const navigator = useNavigator();
  return (
    <View style={{ backgroundColor: "blue", flex: 1, alignItems: "center" }}>
      <Button
        title="go to third"
        onPress={() => {
          //also could be used without passed callback, but strongly recomended
          //to declare navigation outside of current component
          onNavigate(navigator);
        }}
      ></Button>
    </View>
  );
}

function Third() {
  return (
    <View
      style={{ backgroundColor: "green", flex: 1, alignItems: "center" }}
    ></View>
  );
}
```
