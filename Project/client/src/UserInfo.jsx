function UserInfo(props){
    return (<>

    <h3>Name: {props.name}</h3>
    <h4>Designation: {props.designation}</h4>
    <p>{props.children}</p>

    </>)
}


export default UserInfo;