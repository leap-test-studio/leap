export default function LogoRenderer(props) {
  return <img src="/assets/favicon.svg" alt={props.name} {...props} />;
}
