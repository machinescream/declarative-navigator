# Navigator

Welcome to Navigator, a modern navigation tool for React Native. Navigator embraces the power of the react-navigation library, and enhances it with features designed to simplify your coding experience.

## Safer Navigation

Navigator offers a safer navigation experience by statically declaring callback invocations. This approach instantly identifies missing components or incorrect navigation paths, minimising runtime errors.

## No More Zombie Navigation Actions

Forget about matching string route names with components - an error-prone task. Navigator shields you from potential runtime errors resulting from undeclared routes or leftover route names from refactoring. This means cleaner code and fewer headaches.

## Simplified Navigation Experience

Navigator allows you to control your navigation logic easily with the Navigator hook right within your components. For an even cleaner setup, declare your navigation chains statically outside your components.

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

## Coming Soon: Browser navigation Support

Web support is in the works to ensure consistent and smooth navigation experiences across all platforms.

## What does Navigator Deliver?

1. **Convenience**: Navigator tackles the conventional messy pattern matching of routes with components. You won't encounter sudden crashes due to undeclared routes or leftover route names, leading to cleaner code and more manageable navigation.

2. **Safety**: Statically declaring navigation callbacks dramatically increases safety by immediately identifying missing components. It spares you from the routine runtime errors, making your app development more straightforward and lesser tedious.

3. **Versatility**: Navigator is not limited to any specific components and can be easily used across your app.

4. **Efficient Dependency Injection**: Navigator allows for direct injection of dependencies into components. This offers a significant advantage over the traditional method of passing dependencies via props. When used in combination with the Context API, it further enhances the efficiency as dependencies can be easily shared among different components. This design enforces better modularity and significantly eases the testing process. It reduces the amount of boilerplate, leading to more readable and maintain

## Drawbacks

1. **Unserializable Data**: You can't currently store the state of your navigation with this library, which might limit its utility for you. Navigator is particularly designed for in-memory navigation, so it doesn't support persistence out of the box.

2. **Warning Prevention**: Navigator intercepts and prevents typical warnings from React Navigation about duplicate route names and non-serializable props, resulting in a cleaner console and a smoother development experience

## Conclusion

By using the Navigator library, you can spare yourself the headache that comes with messy string route matching. It improves the safety of your code and simplifies navigation. Navigator is an amazing tool that combines the power of react-navigation along with enhanced features, enabling easier and more manageable navigation for your React Native Apps
