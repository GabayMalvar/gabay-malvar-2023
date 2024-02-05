import { useEffect } from 'react';
import { FaInfoCircle } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";

export default function GlobalModal({ isVisible, onClose, onConfirm, modalData }){

	const { type, title, message, confirmTitle, cancelTitle, hideCloseButton, removeBlur, confirmNavigation, removeButtons, autoClose, showIcon } = modalData

	useEffect(() => {
		if(isVisible && autoClose){
			setTimeout(() => {
				onClose()
			}, 5000);
		}
	}, [])

	const getAlertStyle = () => {
    switch (type) {
      case "success":
        return "bg-secondary-green text-safe-white hover:opacity-70;"
      case "error":
      	return "bg-[#ff2a00] text-safe-white hover:opacity-70";
      default:
        return "bg-blue-500 text-white";
    }
  };

  const getIcon = () => {
  	switch (type) {
  	  case "success":
  	    return <FaCircleCheck className="h-12 w-12 mb-4"/>;
  	  case "error":
        return <FaInfoCircle className="h-12 w-12 mb-4"/>;
  	  default:
  	    return null;
  	}
  }

	if(!isVisible) return null

	return(

		<div className={`fixed z-50 inset-0 flex items-center justify-center overflow-y-auto ${removeBlur? "" : "backdrop-blur-lg"}`}>

			<div className="relative max-w-[360px] w-full bg-safe-white rounded-lg shadow-lg text-center mx-2">
				<div className="p-4 flex flex-col items-center">
				  <div className="flex w-full justify-end">
				    {
				    	hideCloseButton?
				    	null
					    :
					    <button
					      onClick={onClose}
					      className="h-[40px] w-[40px] rounded-[10px] bg-orange-500 text-white hover:text-gray-800 text-lg focus:outline-none ml-auto"
					    >
					      &#10005;
					    </button> 
				    }
				  </div>

				  {showIcon? getIcon() : null}
				  
				  <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
				  <p className="text-gray-600 text-lg mb-4">{message}</p>

				  {
				  	cancelTitle && !removeButtons?
				  	<div className="flex flex-row gap-4 w-full">
				  		<button
				  		 onClick={onClose}
				  		 className={`rounded-[10px] w-full py-2 font-semibold focus:outline-none bg-[#BDC4CB] hover:opacity-70`}
				  		>
				  		 {cancelTitle}
				  		</button>

					  	<button
					     onClick={confirmNavigation? confirmNavigation :!onConfirm? onClose : onConfirm}
					     className={`text-white rounded-[10px] w-full py-2 font-semibold focus:outline-none ${getAlertStyle()}`}
					    >
					     {confirmTitle? confirmTitle : "OK"}
					    </button>
				    </div>
				    : !removeButtons?
				    <button
				     onClick={confirmNavigation? confirmNavigation :!onConfirm? onClose : onConfirm}
				     className={`text-white rounded-[10px] w-full py-2 font-semibold focus:outline-none ${getAlertStyle()}`}
				    >
				     {confirmTitle? confirmTitle : "OK"}
				    </button>
				    :
				    null
				  }
				</div>

			</div>	
		</div>
	);
}