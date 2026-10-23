export default function CarpoolSlide({ config }) {
  return <div className="carpool-illustration" aria-label={`${config.carousel.exampleLabel}: fictional classmates sharing a ride`}>
    <div className="carpool-label">{config.carpool.connectionLabel}</div>
    <div className="carpool-route" aria-hidden="true">
      <div className="route-stop route-stop--pickup"><span className="route-dot" /><small>{config.carpool.pickupLabel}</small><strong>{config.carpool.pickup}</strong></div>
      <div className="route-line"><span className="route-car">↗</span></div>
      <div className="route-stop route-stop--destination"><span className="route-dot" /><small>{config.carpool.destinationLabel}</small><strong>{config.carpool.destination}</strong></div>
    </div>
    <div className="fictional-riders"><div className="avatar-stack">{config.carpool.avatars.map((avatar) => <span aria-label={avatar.label} className="fictional-avatar" key={avatar.id} role="img">{avatar.initials}</span>)}</div><p>{config.carpool.disclaimer}</p></div>
  </div>;
}
